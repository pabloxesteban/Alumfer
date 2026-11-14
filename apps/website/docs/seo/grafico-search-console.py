import csv,datetime as dt,collections,sys
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt, matplotlib.dates as md
rows=list(csv.DictReader(open(sys.argv[1])))
W=collections.OrderedDict()
for r in rows:
    d=dt.date.fromisoformat(r["Fecha"]); k=d-dt.timedelta(d.weekday())
    w=W.setdefault(k,[0,0,0.0,0]); c,i=int(r["Clics"]),int(r["Impresiones"])
    w[0]+=c;w[1]+=i;w[2]+=float(r["Posición"])*i;w[3]+=1
ks=list(W); x=[k+dt.timedelta(3) for k in ks]
cl=[W[k][0]/W[k][3] for k in ks]; im=[W[k][1]/W[k][3] for k in ks]; po=[W[k][2]/W[k][1] for k in ks]
partial=[W[k][3]<7 for k in ks]
ink,muted,grid,blue,accent="#1f2937","#6b7280","#e5e7eb","#3867d6","#d08a1e"
fig,(a1,a2,a3)=plt.subplots(3,1,figsize=(11,9),dpi=200,sharex=True,gridspec_kw=dict(height_ratios=[3,2,2],hspace=0.18))
cols=[ "#a9bdf0" if p else blue for p in partial]
a1.bar(x,cl,width=5.2,color=cols,zorder=3)
a2.bar(x,im,width=5.2,color=["#c9cfd8" if p else "#7b8794" for p in partial],zorder=3)
a3.plot(x[:-1],po[:-1],color=ink,lw=1.8,marker="o",ms=3.5,zorder=3); a3.plot(x[-2:],po[-2:],color=ink,lw=1.2,ls=":",zorder=3)
a3.invert_yaxis()
cambios=[(dt.date(2026,8,15),"15 ago\nTítulos y texto propio\nen las 27 localidades"),
         (dt.date(2026,10,2),"2–3 oct\nRediseño y páginas\nmás completas"),
         (dt.date(2026,11,7),"7 nov\nGuías y\npáginas nuevas")]
for a in (a1,a2,a3):
    for d,_ in cambios: a.axvline(d,color=accent,lw=1.2,ls="--",zorder=2)
    for s in ["top","right"]: a.spines[s].set_visible(False)
    for s in ["left","bottom"]: a.spines[s].set_color(grid)
    a.tick_params(colors=muted,labelsize=8); a.grid(axis="y",color=grid,zorder=0)
for d,t in cambios:
    a1.annotate(t,(d,1.0),xycoords=("data","axes fraction"),xytext=(-3 if d.month==11 else 3,4),textcoords="offset points",
            fontsize=7.5,color=accent,ha="right" if d.month==11 else "left",va="bottom")
# promedios por período
per=[("2026-06-29","2026-08-14"),("2026-08-15","2026-10-02"),("2026-10-03","2026-11-06")]
for a,b in per:
    s=[r for r in rows if a<=r["Fecha"]<=b]; v=sum(int(r["Clics"]) for r in s)/len(s)
    da,db=dt.date.fromisoformat(a),dt.date.fromisoformat(b)
    a1.hlines(v,da,db,color=ink,lw=1,zorder=4); a1.text(db,v+0.25,f"{v:.1f}/día".replace(".",","),fontsize=8,color=ink,ha="right",va="bottom",zorder=5)
a1.set_ylabel("Clics por día\n(promedio semanal)",color=muted,fontsize=9)
a2.set_ylabel("Veces que aparecés\nen Google por día",color=muted,fontsize=9)
a3.set_ylabel("Posición promedio\n(más arriba = mejor)",color=muted,fontsize=9)
a1.set_ylim(0,max(cl)*1.05)
a3.xaxis.set_major_locator(md.MonthLocator())
a3.xaxis.set_major_formatter(plt.FuncFormatter(lambda v,p:["","","","","","","jul","ago","sep","oct","nov","dic"][md.num2date(v).month-1] if md.num2date(v).month>=7 else "jun"))
a3.set_xlim(dt.date(2026,6,26),dt.date(2026,11,16))
fig.suptitle("Alumfer en Google: clics, apariciones y posición, semana a semana",x=0.07,ha="left",fontsize=13,color=ink,y=1.0)
fig.text(0.07,0.965,"La barra clara es la última semana, que tiene solo 2 días de datos.",fontsize=8.5,color=muted)
fig.text(0.07,0.03,"Fuente: Google Search Console, búsqueda web, del 29 jun al 10 nov de 2026. Líneas naranjas: fechas en que se publicaron los cambios.",fontsize=7.5,color=muted)
fig.savefig(sys.argv[2],bbox_inches="tight")
