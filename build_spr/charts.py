# -*- coding: utf-8 -*-
import json, math
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm
fm.fontManager.addfont("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf")
matplotlib.rcParams["font.family"]="DejaVu Sans"
matplotlib.rcParams["axes.unicode_minus"]=False

B=json.load(open("computed.json"))
L=B['L']; L8=B['L8']

def fig_xchart(path):
    means=[sum(s)/5 for s in L8]
    k=list(range(1,26))
    fig,ax=plt.subplots(figsize=(8,3.4))
    ax.plot(k,means,'-o',color="#1f3864",ms=4,lw=1.2,label="x̄ próbki")
    ax.axhline(L['xbb'],color="green",lw=1.3,label=f"CL = {L['xbb']:.3f}")
    ax.axhline(L['UCLx'],color="red",lw=1.2,ls="--",label=f"UCL = {L['UCLx']:.3f}")
    ax.axhline(L['LCLx'],color="red",lw=1.2,ls="--",label=f"LCL = {L['LCLx']:.3f}")
    for i,m in enumerate(means):
        if m>L['UCLx'] or m<L['LCLx']:
            ax.plot(i+1,m,'o',color="red",ms=8,mfc="none",mew=1.6)
    ax.set_xlabel("nr próbki"); ax.set_ylabel("x̄ [mm]")
    ax.set_title("Karta kontrolna x̄"); ax.set_xticks(k); ax.tick_params(labelsize=7)
    ax.legend(fontsize=7,loc="lower right",ncol=2); ax.grid(alpha=0.3)
    fig.tight_layout(); fig.savefig(path,dpi=150); plt.close(fig); print("FIG",path)

def fig_rchart(path):
    Rs=[max(s)-min(s) for s in L8]; k=list(range(1,26))
    fig,ax=plt.subplots(figsize=(8,3.4))
    ax.plot(k,Rs,'-o',color="#1f3864",ms=4,lw=1.2,label="R próbki")
    ax.axhline(L['Rb'],color="green",lw=1.3,label=f"CL = {L['Rb']:.3f}")
    ax.axhline(L['UCLr'],color="red",lw=1.2,ls="--",label=f"UCL = {L['UCLr']:.3f}")
    ax.axhline(L['LCLr'],color="red",lw=1.2,ls="--",label="LCL = 0")
    for i,r in enumerate(Rs):
        if r>L['UCLr']:
            ax.plot(i+1,r,'o',color="red",ms=8,mfc="none",mew=1.6)
    ax.set_xlabel("nr próbki"); ax.set_ylabel("R [mm]")
    ax.set_title("Karta kontrolna R"); ax.set_xticks(k); ax.tick_params(labelsize=7)
    ax.legend(fontsize=7,loc="upper right",ncol=2); ax.grid(alpha=0.3)
    fig.tight_layout(); fig.savefig(path,dpi=150); plt.close(fig); print("FIG",path)

def fig_hist(xs,title,path,nbins=7):
    fig,ax=plt.subplots(figsize=(5.4,3.4))
    lo=min(xs); hi=max(xs); w=(hi-lo)/nbins
    edges=[lo+i*w for i in range(nbins+1)]
    ax.hist(xs,bins=edges,color="#2e5496",edgecolor="white")
    ax.set_xlabel("przedziały wartości [mm]"); ax.set_ylabel("liczebność mᵢ")
    ax.set_title(title); ax.tick_params(labelsize=7)
    fig.tight_layout(); fig.savefig(path,dpi=150); plt.close(fig); print("FIG",path)

fig_xchart("ch_x.png")
fig_rchart("ch_r.png")
fig_hist([sum(s)/5 for s in L8],"Histogram średnich x̄ (L8)","ch_hist_means.png",7)
fig_hist(B['S1'],"Histogram – Seria 1","ch_hist_s1.png",8)
fig_hist(B['S2'],"Histogram – Seria 2","ch_hist_s2.png",8)
