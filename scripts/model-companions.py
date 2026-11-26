"""Build the six companion GLBs and posters. Run in Blender from the repo root."""
import bpy
from pathlib import Path
from math import sin, cos, pi
from mathutils import Vector

OUTPUT = Path("/tmp/lernhub-companion-models")
OUTPUT.mkdir(parents=True, exist_ok=True)

def material(name, color, rough=.41, metal=0, glow=0):
    m=bpy.data.materials.new(name)
    m.use_nodes=True
    n=m.node_tree.nodes.get("Principled BSDF")
    n.inputs["Base Color"].default_value=(*color,1)
    n.inputs["Metallic"].default_value=metal
    n.inputs["Roughness"].default_value=rough
    n.inputs["Emission Color"].default_value=(*color,1)
    n.inputs["Emission Strength"].default_value=glow
    return m

def assign(obj,name,mat):
    obj.name=name
    obj.data.materials.append(mat)
    if obj.type=="MESH":
        for face in obj.data.polygons: face.use_smooth=True
    return obj

def ell(name,loc,scale,mat,rot=(0,0,0),detail=20):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=detail,ring_count=max(8,detail//2),location=loc)
    obj=bpy.context.object
    obj.scale=scale
    obj.rotation_euler=rot
    return assign(obj,name,mat)

def curve(name,pts,depth,mat,closed=False):
    data=bpy.data.curves.new(name,'CURVE')
    data.dimensions='3D'
    data.resolution_u=7
    data.bevel_depth=depth
    data.bevel_resolution=2
    spline=data.splines.new('BEZIER')
    spline.bezier_points.add(len(pts)-1)
    for bp,co in zip(spline.bezier_points,pts):
        bp.co=co
        bp.handle_left_type=bp.handle_right_type='AUTO'
    spline.use_cyclic_u=closed
    obj=bpy.data.objects.new(name,data)
    bpy.context.collection.objects.link(obj)
    return assign(obj,name,mat)

def rounded(name,loc,scale,mat,radius=.075):
    bpy.ops.mesh.primitive_cube_add(size=2,location=loc)
    obj=bpy.context.object
    obj.scale=scale
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    b=obj.modifiers.new("Soft manufactured edges",'BEVEL')
    b.width,b.segments=radius,4
    obj.modifiers.new("Panel normals",'WEIGHTED_NORMAL')
    return assign(obj,name,mat)

def taper(name, rings, mat, ripples=0, facets=28):
    verts=[]; faces=[]
    for Z,rx,ry,x,y in rings:
        for j in range(facets):
            a=2*pi*j/facets
            w=1+ripples*cos(6*a)
            verts.append((x+rx*cos(a)*w,y+ry*sin(a)*w,Z))
    for row in range(len(rings)-1):
        for j in range(facets):
            nj=(j+1)%facets
            faces.append((row*facets+j,row*facets+nj,(row+1)*facets+nj,(row+1)*facets+j))
    faces += [tuple(reversed(range(facets))),tuple((len(rings)-1)*facets+i for i in range(facets))]
    mesh=bpy.data.meshes.new(name)
    mesh.from_pydata(verts,[],faces)
    mesh.update()
    obj=bpy.data.objects.new(name,mesh)
    bpy.context.collection.objects.link(obj)
    return assign(obj,name,mat)

def leaf(name, start, end, width, mat, bend=.14):
    a,b=Vector(start),Vector(end)
    line=b-a
    cross=line.cross(Vector((0,1,.15))).normalized()
    axis=Vector((0,-1,0))
    verts=[]
    for ratio in (0,.19,.4,.6,.79,1):
        peak=sin(pi*ratio)
        center=a+line*ratio+axis*(bend*peak)
        verts.extend((center-cross*width*peak,center+axis*(.027*peak),center+cross*width*peak))
    faces=[(i+j,i+j+3,i+j+4,i+j+1) for i in range(0,15,3) for j in range(2)]
    mesh=bpy.data.meshes.new(name)
    mesh.from_pydata(verts,[],faces);mesh.update()
    obj=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(obj)
    mod=obj.modifiers.new("Leaf thickness",'SOLIDIFY')
    mod.thickness=.015
    return assign(obj,name,mat)

def face(x,y,z,spread,mat,eye=.052):
    for i,tag in [(-1,'L'),(1,'R')]:
        ell('Eye_'+tag,(x+i*spread,y,z),(eye,.026,eye*1.23),mat,detail=14)
        ell('Lens_'+tag,(x+i*spread,y-.006,z),(eye*1.45,.022,eye*.42),mat,detail=14)
    shapes={
      'neutral':[(-1,0),(0,-.08),(1,0)], 'happy':[(-1,.2),(0,-.45),(1,.2)],
      'excited':[(-1,.25),(0,-.72),(1,.25),(0,.04),(-1,.25)],'curious':[(-.65,-.05),(.2,-.32),(.86,.18)],
      'focused':[(-.8,0),(0,0),(.8,0)],'surprised':[(0,.4),(.6,-.05),(0,-.5),(-.6,-.05),(0,.4)],
      'proud':[(-1,0),(0,-.26),(1,.22)], 'thoughtful':[(-.77,-.21),(0,.16),(.8,.04)]}
    for label,points in shapes.items():
        curve('Face_'+label,[(x+u*spread*.62,y,z-spread*.95+v*spread*.63) for u,v in points],.012,mat)

def ember():
    coal=material('Glazed burnt clay',(.32,.06,.025),.32)
    flame=material('Fire amber enamel',(.92,.28,.047),.34,0,.18)
    hot=material('Glowing filament',(.99,.68,.24),.37,0,.32)
    taper('Body',[(.30,.30,.25,0,0),(.42,.55,.38,0,0),(.78,.63,.48,0,0),(1.19,.52,.43,.02,0),(1.55,.40,.37,.09,.03),(1.90,.28,.26,.18,.1),(2.26,.14,.13,.20,.10),(2.43,.025,.024,.34,.11)],flame,.10)
    ell('CoalBase',(0,.025,.53),(.54,.44,.29),coal)
    for i,(side,end) in enumerate([(-1,1.65),(1,1.83),(-1,2.04)]):
        x=side*(.35+i*.044)
        taper('FlameTongue'+str(i),[(.54,.17,.16,x,.17),(.94,.23,.19,x,.12),(1.32,.18,.12,x+side*.09,.12),(end,.019,.018,x+side*.21,.14)],hot,.07,20)
        curve('CalderaSeam'+str(i),[(x,-.36,.56),(x*.78,-.44,.81),(x*.66,-.42,1.01)],.014,hot)
    for side in [-1,1]:
        ell('CoalFoot', (side*.24,-.04,.32),(.20,.27,.12),coal,(0,side*.15,0))
    face(.02,-.453,1.14,.165,material('Ember eyes',(.14,.029,.02)))
    taper('Stage1_BackFlame',[(.70,.31,.21,0,.29),(1.45,.34,.25,-.07,.32),(2.28,.12,.15,-.29,.38),(2.52,.012,.02,-.44,.38)],flame)
    ell('Stage2_CorePlate',(0,.24,.67),(.55,.33,.39),coal)
    taper('Stage3_Ribbon',[(.60,.10,.16,.41,.14),(1.24,.18,.17,.56,.16),(1.87,.14,.14,.55,.23),(2.37,.016,.025,.78,.24)],hot)

def spectre():
    violet=material('Pearl lilac glaze',(.46,.415,.72),.31,.12)
    milk=material('Mist opal',(.78,.77,.91),.40,.12)
    cheek=material('Pink blush enamel',(.74,.39,.60))
    taper('Body',[(.52,.32,.25,-.3,.15),(.70,.50,.38,-.19,.04),(1.02,.68,.48,-.05,0),(1.44,.64,.46,.02,0),(1.81,.46,.39,.06,.02),(2.08,.28,.26,.06,.02),(2.17,.061,.052,.1,.03)],violet,.10)
    ell('SoftMask',(.075,-.29,1.42),(.52,.25,.50),milk,(0,.06,0))
    for side in [-1,1]:
        ell('Sleeve',(side*.56,-.09,1.06),(.20,.24,.16),milk,(0,side*.38,0))
        ell('Blush',(side*.245+.065,-.511,1.31),(.063,.015,.035),cheek)
    for i in range(4):
        x=-.51+i*.29
        taper('Scallop_'+str(i),[(.48+(.04*(i%2)),.072,.08,x-.13,.15),(.69,.17,.16,x,.12),(.99,.24,.23,x+.1,.13)],milk,0,16)
    face(.08,-.552,1.51,.169,material('Spectre eyes',(.115,.065,.24)))
    taper('Stage1_Curl',[(.50,.06,.06,-.55,.25),(.65,.13,.16,-.66,.26),(1.08,.15,.21,-.39,.27),(1.46,.12,.16,-.31,.23)],violet)
    taper('Stage2_Tail',[(.45,.026,.02,.60,.38),(.61,.11,.08,.52,.34),(.85,.19,.16,.30,.32),(1.17,.22,.20,.19,.31)],milk)
    for side in [-1,1]:
        ell('Stage3_Wisp',(side*.61,.25,1.61),(.16,.2,.35),violet,(0,side*.5,0))

def bloom():
    green=material('Sage ceramic',(.25,.52,.27),.42)
    leafmat=material('Leaf wax',(.095,.35,.16),.48)
    petal=material('Peach blossom glaze',(.77,.30,.27),.35)
    gold=material('Pollen clay',(.84,.61,.19),.46)
    taper('Body',[(.27,.25,.22,0,0),(.43,.42,.34,0,0),(.82,.53,.42,0,0),(1.20,.46,.37,0,0),(1.38,.31,.3,0,0),(1.52,.06,.06,0,0)],green)
    ell('SeedHeart',(0,-.285,1.27),(.44,.21,.39),gold)
    for n in range(8):
        a=n*pi/4
        ell('Petal'+str(n),(.45*cos(a),-.13,1.34+.42*sin(a)),(.29,.16,.16),petal,(0,-a,0))
        ell('Pollen'+str(n),(.30*cos(a),-.45,1.27+.26*sin(a)),(.026,.022,.023),petal,detail=10)
    for side in [-1,1]:
        curve('Stem',[(0,.04,.53),(side*.32,.01,.61),(side*.61,.02,.89)],.037,green)
        leaf('ShoulderLeaf',(side*.28,.01,.57),(side*.80,.01,1.09),.19,leafmat)
        leaf('RootLeaf',(side*.09,.01,.34),(side*.63,-.08,.44),.10,green)
        leaf('Stage1_Leaf',(side*.20,.06,1.36),(side*.67,.15,1.99),.16,leafmat)
        leaf('Stage3_Calyx',(side*.20,.24,1.04),(side*.75,.31,1.58),.16,green)
    ell('Stage2_HighBud',(.21,.18,1.79),(.19,.14,.34),petal,(0,.45,0))
    face(0,-.50,1.36,.146,material('Bloom eyes',(.16,.08,.042)))

def glitch():
    navy=material('Indigo stamped alloy',(.069,.135,.29),.35,.26)
    teal=material('Brushed turquoise metal',(.15,.48,.51),.28,.37)
    white=material('Display phosphor',(.50,.94,.84),.31,.0,.6)
    screw=material('Muted copper fittings',(.52,.26,.14),.32,.5)
    glass=material('Dark glass display',(.012,.055,.060),.25,.08)
    rounded('Body',(0,0,.87),(.48,.37,.37),navy,.12)
    rounded('HeadShroud',(0,-.05,1.49),(.62,.44,.46),teal,.14)
    rounded('ScreenRim',(0,-.42,1.50),(.475,.09,.33),navy,.11)
    rounded('Screen',(0,-.501,1.50),(.408,.026,.27),glass,.082)
    for side in [-1,1]:
        rounded('Hand',(side*.63,-.04,.93),(.14,.145,.21),teal,.061)
        rounded('Shoulder',(side*.52,.018,1.04),(.12,.17,.18),screw,.06)
        rounded('Boot',(side*.29,-.057,.36),(.22,.27,.115),navy,.075)
        ell('Pivot',(side*.61,-.045,1.49),(.12,.171,.17),screw)
        ell('PivotCap',(side*.683,-.045,1.49),(.091,.115,.105),teal)
        rounded('Stage1_Antenna',(side*.41,.05,2.00),(.034,.046,.17),screw,.02)
        ell('Stage1_Cap',(side*.41,.05,2.16),(.059,.059,.055),white,detail=10)
        rounded('Stage3_ToolRack',(side*.53,.23,1.20),(.12,.21,.32),navy,.056)
    for i in range(3):
        rounded('ChassisVent',(-.20+i*.20,-.365,.93),(.065,.026,.027),white,.012)
    rounded('Stage2_WaistPack',(0,.35,.84),(.4,.15,.29),teal,.08)
    face(0,-.535,1.55,.157,white)

def cosmo():
    blue=material('Midnight lapis',(.10,.145,.36),.31,.15)
    ice=material('Cloud ceramic',(.47,.56,.76),.42)
    moon=material('Honey moon clay',(.71,.53,.26),.46)
    radiant=material('Starlight inlay',(.82,.86,.60),.35,.0,.55)
    ell('Body',(0,.04,1.21),(.63,.48,.64),blue,detail=32)
    ell('VisorPlate',(0,-.305,1.26),(.50,.25,.44),blue)
    for i,(x,z,size) in enumerate([(-.35,1.57,.13),(.33,1.45,.11),(.20,.88,.09),(-.28,1.17,.075)]):
        ell('MeteorBasin'+str(i),(x,-.423,z),(size,.019,size*.73),ice,(.03,-.16,.12),12)
    curve('OuterRim',[(.91*cos(j*pi/8),.62*sin(j*pi/8)+.1,1.24+.30*cos(j*pi/8)) for j in range(16)],.033,ice,True)
    ell('LittleMoon',(.78,.04,1.59),(.18,.18,.18),moon)
    ell('MoonRim',(.74,-.114,1.66),(.073,.027,.045),ice,detail=12)
    ell('SmallComet',(-.66,.24,.94),(.12,.15,.12),ice)
    curve('CometTail',[(-.66,.28,.96),(-.84,.55,.99),(-.83,.79,1.02)],.019,radiant)
    ell('Stage1_NightMoon',(-.64,.36,1.64),(.14,.15,.13),ice)
    curve('Stage2_Orbit',[(.83*cos(j*pi/8),.71*sin(j*pi/8),1.27-.35*cos(j*pi/8)) for j in range(16)],.018,radiant,True)
    ell('Stage3_Satellite',(.41,.44,1.94),(.14,.11,.14),moon)
    face(0,-.558,1.30,.164,radiant)

def pflanziska():
    bark=material('Woody cane',(.22,.105,.049),.63)
    straw=material('Wicker straw',(.42,.27,.15),.65)
    trim=material('Wicker light',(.68,.46,.27),.59)
    green=material('Leaf wax',(.13,.32,.09),.39)
    green2=material('Sage leaf edge',(.35,.53,.16),.48)
    soil=material('Potting soil',(.082,.045,.027),.78)
    taper('Planter',[(.24,.29,.28,0,0),(.34,.34,.32,0,0),(.53,.42,.37,0,0),(.74,.45,.41,0,0)],straw,0,32)
    ell('Soil',(0,0,.73),(.41,.37,.067),soil)
    for row in range(12):
        ratio=row/11
        radius=.32+.13*ratio
        yratio=.92
        points=[(cos(j*pi/10)*radius, sin(j*pi/10)*radius*yratio,.27+ratio*.46+.011*cos(j*pi+row)) for j in range(20)]
        curve('Weave_'+str(row),points,.012 if row not in (0,11) else .026,trim if row%3 else straw,True)
    for j in range(16):
        a=j*pi/8
        curve('WickerStave_'+str(j),[(cos(a)*(.318+i*.020),sin(a)*(.296+i*.018),.27+i*.07) for i in range(7)],.009,trim)
    taper('Body',[(.72,.10,.095,0,0),(1.24,.092,.093,-.05,0),(1.68,.083,.081,-.11,.02),(2.12,.065,.060,-.14,.04),(2.29,.019,.018,-.14,.05)],bark,.11)
    curve('SmallCane',[(.14,.01,.73),(.23,.11,1.00),(.26,.14,1.36)],.045,bark)
    for n in range(13):
        a=n*2.399
        length=.46+(.14*(n%3))
        end=(-.14+cos(a)*length,.05+sin(a)*length,2.12+(n%4)*.16)
        leaf('NarrowLeaf'+str(n),(-.13,.045,1.82+(n%3)*.09),end,.062 if n%2 else .089,green if n%3 else green2,.06)
    for n in range(7):
        a=n*2.399
        leaf('SmallShoot',(.25,.14,1.24),(.25+cos(a)*.35,.14+sin(a)*.28,1.42+(n%3)*.13),.052,green2)
    paper=[material('Ochre cut paper',(.92,.64,.19),.72),material('Pink origami',(.73,.29,.47),.72),material('Blue paper',(.07,.43,.68),.69)]
    for i,(x,y,z) in enumerate([(-.40,-.31,1.79),(.17,-.25,1.71),(.39,-.13,1.29)]):
        curve('Thread'+str(i),[(x,y,z+.29),(x,y,z+.17),(x,y,z+.10)],.006,trim)
        obj=rounded('PaperTag'+str(i),(x,y,z),(.072,.012,.097),paper[i],.011)
        obj.rotation_euler.y=.38 if i==0 else -.39
    face(0,-.426,.57,.121,material('Pot face',(.144,.068,.032)),.038)
    blush=material('Rose cheeks',(.65,.27,.23))
    for side in [-1,1]:
        ell('PotBlush',(side*.176,-.403,.51),(.037,.016,.023),blush,detail=12)
    leaf('Stage1_Sapling',(-.27,.11,1.39),(-.69,.09,1.98),.074,green2)
    curve('Stage2_Stem',[(.30,.21,.78),(.38,.26,1.18),(.52,.26,1.57)],.038,bark)
    for n in range(4):
        a=n*pi/2
        leaf('Stage2_YoungLeaf',(.52,.26,1.43),(.52+cos(a)*.32,.26+sin(a)*.26,1.73),.068,green2)
    for side in [-1,1]:
        leaf('Stage3_ExtraCrown',(-.15,.04,2.07),(-.15+side*.43,.23,2.57),.085,green2)

def accessories(center,height,width):
    mint=material('Sage accessory',(.24,.45,.27))
    gold=material('Copper crown',(.52,.27,.086),.33,.57)
    glow=material('Accessory light',(.40,.73,.90),.33,0,.25)
    petal=material('Garden pink',(.80,.39,.47),.47)
    y=-.11
    curve('Accessory_stellar_brim',[(-width,y,height),(0,y-.05,height+.12),(width,y,height)],.026,gold)
    curve('Accessory_garden_vine',[(-width,y,height),(0,y-.11,height+.07),(width,y,height)],.023,mint)
    for k in [-1,0,1]:
        ell('Accessory_stellar_spire',(k*width*.65,y-.04,height+.14+(.045 if k==0 else 0)),(.034,.031,.088),gold,detail=12)
        for n in range(5):
            a=n*2*pi/5
            ell('Accessory_garden_petal',(k*width*.65+.054*cos(a),y-.125,height+.085+.054*sin(a)),(.034,.022,.038),petal,detail=10)
    curve('Accessory_ring',[(.95*cos(j*pi/8),.54*sin(j*pi/8)+.10,center+.17*cos(j*pi/8)) for j in range(16)],.015,glow,True)
    for side in [-1,1]:
        ell('Accessory_crystals',(side*.86,.04,center+.33),(.05,.05,.14),glow,(0,side*.3,0),8)
        ell('Accessory_particles',(side*.64,.06,center-.48),(.025,.025,.025),glow,detail=10)

def target(obj, point):
    obj.rotation_euler=(Vector(point)-obj.location).to_track_quat('-Z','Y').to_euler()

def render(id):
    if id in ('ember', 'spectre'):
        for obj in bpy.data.objects:
            if obj.name == 'Body' or obj.name.startswith('FlameTongue'):
                bpy.context.view_layer.objects.active = obj
                obj.select_set(True)
                smooth = obj.modifiers.new('Sculpted contour','SUBSURF')
                smooth.levels = 1
                bpy.ops.object.modifier_apply(modifier=smooth.name)
                obj.select_set(False)
    for obj in bpy.data.objects:
        if obj.name.startswith("Eye_"):
            obj.shape_key_add(name="Basis")
            blink = obj.shape_key_add(name="EyeBlink")
            wide = obj.shape_key_add(name="EyeWide")
            for point in blink.data:
                point.co.z *= .16
            for point in wide.data:
                point.co.z *= 1.24
    bpy.ops.export_scene.gltf(filepath=str(OUTPUT/(id+'.glb')),export_format='GLB',export_animations=False)
    for obj in bpy.data.objects:
        obj.hide_render=obj.name.startswith(('Accessory_','Stage','Lens_')) or (obj.name.startswith('Face_') and obj.name!='Face_neutral')
    bpy.ops.object.camera_add(location=(2.75,-7,3.0))
    camera=bpy.context.object
    target(camera,(0,0,1.28 if id=='pflanziska' else 1.18))
    camera.data.type='ORTHO'
    camera.data.ortho_scale=2.80
    scene=bpy.context.scene
    scene.camera=camera
    for loc,energy,color in [((-3,-4,5),710,(1,.89,.75)),((3,-3,3),390,(.78,.92,1)),((2,3,5),730,(.82,.91,1))]:
        bpy.ops.object.light_add(type='AREA',location=loc)
        light=bpy.context.object
        light.data.energy,light.data.color,light.data.size=energy,color,4
        target(light,(0,0,1.1))
    scene.world.color=(.25,.25,.25)
    scene.render.engine='CYCLES'
    scene.cycles.samples=36
    scene.cycles.use_denoising=False
    scene.render.resolution_x=scene.render.resolution_y=400
    scene.render.resolution_percentage=100
    scene.render.image_settings.file_format='PNG'
    scene.render.film_transparent=True
    scene.render.filepath='/tmp/lernhub-'+id+'-model-poster.png'
    bpy.ops.render.render(write_still=True)

for id,build,anchor in [('ember',ember,(1.05,1.74,.37)),('spectre',spectre,(1.10,1.82,.36)),('bloom',bloom,(.99,1.68,.40)),
                        ('glitch',glitch,(1.07,1.89,.43)),('cosmo',cosmo,(1.05,1.74,.43)),('pflanziska',pflanziska,(1.14,1.83,.36))]:
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    build()
    accessories(*anchor)
    render(id)
