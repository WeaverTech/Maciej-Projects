"""Generuje pliki wzorcowe (golden) z rdzenia Kawasaki Palletizer 2.3 (Python).

Uruchomienie (z katalogu rozpakowanej wersji 2.3):
    PYTHONPATH=src python gen_fixtures.py <katalog_wyjsciowy>
"""
import json, sys, itertools
from pathlib import Path
from palletizer.models import *
from palletizer.core import *

out = Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)

def dump(name, p):
    data = {"project": p.to_dict()}
    try:
        data["as"] = render_as(p)
    except Exception as e:
        data["as_error"] = str(e)
    data["validation"] = {n: [[s, m, ids] for s, m, ids in validate_geometry(p, n)] for n in p.layers}
    data["compare_ab"] = [[s, m] for s, m in compare_ab(p)]
    cy, errs = cycles(p)
    data["cycles"] = [[list(t) for t in c] for c in cy]
    data["cycle_errors"] = errs
    (out / f"{name}.json").write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

# 1. pojedynczy chwyt, tylko warstwa A, generator 6 szt.
p = Project(); generate(p, 6, 0); dump("single_a", p)

# 2. pojedynczy chwyt, A+B
p = Project(); generate(p, 4, 0); rotate_b(p); dump("single_ab", p)

# 3. podwojny chwyt, A+B, obroty mieszane
p = Project(); generate(p, 6, 90); p.layers["A"].items[1].rotation = 0; p.layers["A"].items[4].rotation = 270
p.robot.pick_mode = "podwojny"; rotate_b(p); dump("double_ab", p)

# 4. karton, kolizje i wystawanie, naroznik B, osie lewo/dol
p = Project(); p.product.kind = Kind.BOX; p.product.length = 400; p.product.width = 300; p.product.height = 250; p.product.layer_increment = 250
p.pallet.base_corner = Corner.B; p.pallet.x_direction = "lewo"; p.pallet.y_direction = "dol"
p.layers["A"].items = [Placement(1, 200, 150, 0, 1), Placement(2, 590, 150, 0, 2), Placement(3, 1100, 700, 90, 3), Placement(4, 450.5, 480.25, 90, 4)]
p.robot.layers = 4; p.robot.first_z = -250; p.robot.safe_z = 600; p.robot.program_name = "kartony"; p.robot.base_name = "bazapal"
dump("box_corner_b", p)

# 5. worek z dopuszczalnym wystawaniem/nakladaniem na granicy
p = Project(); p.layers["A"].items = [Placement(1, 270, 200, 0, 1), Placement(2, 850, 200, 0, 2), Placement(3, 290, 580, 0, 3), Placement(4, 900, 600, 180, 4), Placement(5, 600, 830, 0, 5)]
dump("bag_limits", p)

# 6. podwojny chwyt z blednymi cyklami
p = Project(); generate(p, 5, 0); p.robot.pick_mode = "podwojny"; p.robot.assignments = "1=1,2=1;3=1,4=3;9=1;x=2"
dump("double_bad_cycles", p)

# 7. osie rownolegle
p = Project(); generate(p, 2, 0); p.pallet.x_direction = "prawo"; p.pallet.y_direction = "lewo"; dump("bad_axes", p)

# transformacje: wszystkie narozniki i kierunki
rows = []
for c in Corner:
    for xd, yd in itertools.product(VECTORS, VECTORS):
        p = Project(); p.pallet.length = 1200; p.pallet.width = 800; p.pallet.base_corner = c; p.pallet.x_direction = xd; p.pallet.y_direction = yd
        for (x, y) in [(0, 0), (100, 600), (1200, 800), (333.5, 12.25)]:
            a, b = transform(x, y, p)
            rows.append({"corner": c.value, "x_direction": xd, "y_direction": yd, "x": x, "y": y, "bx": a, "by": b, "valid": axes_valid(p)})
(out / "transforms.json").write_text(json.dumps(rows, indent=1), encoding="utf-8")
print("ok", len(rows))
