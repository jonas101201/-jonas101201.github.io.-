"""Build the Orbit GLB and poster from the same Blender scene.
Run: blender -b --factory-startup -t 2 --python scripts/model-orbit.py
"""
from math import cos, sin, pi, radians
from pathlib import Path
import bpy
from mathutils import Vector

ROOT = Path("/tmp/lernhub-companion-models")
ROOT.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)

def ceramic(name, rgb, roughness=.35, metallic=.0, emission=0):
    result = bpy.data.materials.new(name)
    result.use_nodes = True
    shader = result.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = (*rgb, 1)
    shader.inputs["Metallic"].default_value = metallic
    shader.inputs["Roughness"].default_value = roughness
    shader.inputs["Emission Color"].default_value = (*rgb, 1)
    shader.inputs["Emission Strength"].default_value = emission
    return result

PEARL = ceramic("Ivory ceramic", (.83, .73, .53), .29, .23)
CREAM = ceramic("Glazed shell", (.94, .87, .68), .32, .16)
RIM = ceramic("Champagne alloy", (.42, .22, .087), .24, .71)
DARK = ceramic("Blue ceramic", (.095, .16, .205), .29, .26)
VISOR = ceramic("Recessed blue visor", (.014, .043, .06), .26, .16)
LIGHT = ceramic("Visor lights", (.27, .91, .98), .35, .0, 1.45)
MINT = ceramic("Sage enamel", (.22, .46, .26), .41, .11)
PINK = ceramic("Petal enamel", (.87, .35, .43), .38, .04)

def finish(obj, name, mat):
    obj.name = name
    obj.data.materials.append(mat)
    if obj.type == "MESH":
        for face in obj.data.polygons:
            face.use_smooth = True
    return obj

def ellipsoid(name, loc, size, mat, rotation=(0, 0, 0), resolution=24):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=resolution, ring_count=max(8, resolution // 2), location=loc)
    obj = bpy.context.object
    obj.scale = size
    obj.rotation_euler = rotation
    return finish(obj, name, mat)

def arc(name, points, thickness, mat):
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions = "3D"
    curve.resolution_u = 12
    curve.bevel_depth = thickness
    curve.bevel_resolution = 2
    spline = curve.splines.new("BEZIER")
    spline.bezier_points.add(len(points) - 1)
    for point, location in zip(spline.bezier_points, points):
        point.co = location
        point.handle_left_type = "AUTO"
        point.handle_right_type = "AUTO"
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    return finish(obj, name, mat)

def ring(name, center, radius, thickness, mat, tilt=.15):
    points = [(center[0] + cos(i * pi / 8) * radius, center[1] + sin(i * pi / 8) * radius * .73,
               center[2] + cos(i * pi / 8) * tilt) for i in range(16)]
    obj = arc(name, points, thickness, mat)
    obj.data.splines[0].use_cyclic_u = True
    return obj

# The visor is inset into a separate bronze rim and carved ceramic face plate.
ellipsoid("Body", (0, 0, 1.12), (.78, .53, .82), PEARL, resolution=40)
ellipsoid("ShellCrown", (-.15, -.09, 1.58), (.59, .44, .40), CREAM, (0,-.23,-.09), 32)
ellipsoid("FaceHousing", (.10, -.36, 1.35), (.65, .24, .55), CREAM, resolution=32)
ellipsoid("VisorGasket", (.11, -.55, 1.38), (.55, .15, .46), RIM, resolution=36)
ellipsoid("Visor", (.12, -.65, 1.39), (.505, .102, .416), VISOR, (0,-.03,0), 36)
ellipsoid("LowerPanel", (.28, -.328, .73), (.47, .20, .30), DARK, (0,.13,-.05))
for side in [-1, 1]:
    tag = "L" if side < 0 else "R"
    ellipsoid("Hinge_" + tag, (side*.69, -.06, 1.04), (.21,.21,.28), RIM)
    ellipsoid("Flipper_" + tag, (side*.79,-.014,.88), (.21,.24,.36), DARK, (0,side*.43,side*.11))
    ellipsoid("FlipperShell_" + tag, (side*.82,-.115,.89), (.151,.15,.25), PEARL, (0,side*.43,side*.11))
    ellipsoid("HingePin_" + tag, (side*.79,-.254,1.08), (.056,.035,.059), RIM)
    ellipsoid("Foot_" + tag, (side*.33,-.02,.35), (.226,.31,.123), DARK, (0,0,side*.13))
    ellipsoid("Sole_" + tag, (side*.33,-.043,.283), (.232,.315,.05), RIM)
for i in range(4):
    ellipsoid("VentScrew_" + str(i), (.03+i*.104,-.514,.64+i*.016), (.024,.021,.025), RIM, resolution=12)
for i in range(3):
    arc("ShellRib_" + str(i), [(-.58,-.18-i*.025,.86+i*.07),(-.58,-.39,1.12+i*.065),
        (-.46,-.38,1.41+i*.058),(-.31,-.26,1.64+i*.048)], .017, RIM)
arc("AntennaStem", [(-.44,-.04,1.73),(-.54,-.04,2.00),(-.61,-.04,2.17)], .041, RIM)
ellipsoid("AntennaDish", (-.60,-.05,2.18), (.15,.045,.12), RIM, (.28,-.43,0))
ellipsoid("AntennaReceiver", (-.62,-.095,2.21), (.085,.029,.065), DARK, (.28,-.43,0))
ellipsoid("AntennaBulb", (-.63,-.129,2.24), (.029,.029,.029), LIGHT, resolution=12)

# Named face pieces, stage geometry and independent accessories.
for x,tag in [(-.05,"L"),(.30,"R")]:
    ellipsoid("Eye_" + tag, (x,-.746,1.46), (.068,.025,.072), LIGHT)
    ellipsoid("Lens_" + tag, (x,-.752,1.46), (.092,.022,.033), LIGHT)
mouths = {
 "neutral":[(0,1.255),(.095,1.245),(.19,1.26)], "happy":[(0,1.28),(.09,1.195),(.19,1.28)],
 "excited":[(0,1.28),(.095,1.17),(.19,1.28),(.095,1.255),(0,1.28)],
 "curious":[(.05,1.245),(.13,1.225),(.205,1.267)], "focused":[(.025,1.245),(.095,1.245),(.17,1.245)],
 "surprised":[(.09,1.29),(.145,1.245),(.09,1.195),(.038,1.245),(.09,1.29)],
 "proud":[(0,1.25),(.105,1.208),(.195,1.28)], "thoughtful":[(.03,1.227),(.10,1.265),(.165,1.25)]
}
for expression,points in mouths.items():
    arc("Face_" + expression, [(x,-.740,z) for x,z in points], .014, LIGHT)

for side in [-1,1]:
    tag = "L" if side < 0 else "R"
    ellipsoid("Stage1_Sensor_" + tag, (side*.64,.08,1.59), (.11,.18,.24), CREAM, (0,side*.47,0))
    ellipsoid("Stage1_Pin_" + tag, (side*.65,-.075,1.63), (.053,.025,.058), LIGHT, resolution=12)
    ellipsoid("Stage2_Vent_" + tag, (side*.68,.25,1.18), (.16,.31,.33), DARK, (0,side*.33,0))
    ellipsoid("Stage2_Rib_" + tag, (side*.74,.12,1.22), (.105,.24,.26), RIM, (0,side*.33,0))
    ellipsoid("Stage3_Panel_" + tag, (side*.46,.24,1.72), (.13,.26,.48), PEARL, (0,side*.30,side*.08))
    ellipsoid("Accessory_crystals_" + tag, (side*.99,-.03,1.55), (.057,.061,.18), LIGHT, (0,side*.39,0), 8)
    ellipsoid("Accessory_particles_" + tag, (side*.93,-.10,.69), (.035,.035,.035), LIGHT, resolution=12)
ring("Accessory_ring", (0,.03,.99), 1.02, .02, LIGHT)
arc("Accessory_stellar_band", [(-.39,-.15,1.80),(0,-.21,1.95),(.39,-.15,1.80)], .039, RIM)
for i,x in enumerate([-.22,0,.22]):
    ellipsoid("Accessory_stellar_tip"+str(i), (x,-.21,1.98 + (.08 if i==1 else 0)), (.037,.061,.13), RIM, resolution=12)
arc("Accessory_garden_vine", [(-.37,-.17,1.80),(0,-.24,1.91),(.37,-.17,1.81)], .027, MINT)
for i,x in enumerate([-.23,0,.23]):
    for k in range(5):
        angle=k*2*pi/5
        ellipsoid(f"Accessory_garden_{i}_{k}", (x+cos(angle)*.059,-.262,1.91+sin(angle)*.059), (.046,.025,.05), PINK, resolution=12)

for obj in bpy.data.objects:
    if obj.name.startswith("Eye_"):
        obj.shape_key_add(name="Basis")
        blink = obj.shape_key_add(name="EyeBlink")
        wide = obj.shape_key_add(name="EyeWide")
        for point in blink.data:
            point.co.z *= .16
        for point in wide.data:
            point.co.z *= 1.24

# Export all geometry. The viewer activates stage, expression and accessory meshes.
bpy.ops.export_scene.gltf(filepath=str(ROOT / "orbit.glb"), export_format="GLB", export_animations=False)
for obj in bpy.data.objects:
    if obj.name.startswith(("Accessory_", "Stage", "Lens_")) or obj.name.startswith("Face_") and obj.name != "Face_neutral":
        obj.hide_render = True

scene = bpy.context.scene
def point_at(obj, point):
    obj.rotation_euler = (Vector(point) - obj.location).to_track_quat("-Z", "Y").to_euler()
def light(loc, energy, color, size):
    bpy.ops.object.light_add(type="AREA", location=loc)
    obj = bpy.context.object
    obj.data.energy, obj.data.color, obj.data.shape, obj.data.size = energy, color, "DISK", size
    point_at(obj, (0,0,1.2))

bpy.ops.object.camera_add(location=(3.3,-7,3.05))
camera = bpy.context.object
point_at(camera,(0,0,1.19))
camera.data.type, camera.data.ortho_scale = "ORTHO", 2.55
scene.camera = camera
light((-3,-4,5),720,(1,.88,.69),4.5)
light((2,-3,2.5),410,(.74,.88,1),3.5)
light((1,3,5),850,(.77,.90,1),3)
scene.world.color = (.27,.27,.27)
scene.render.engine = "CYCLES"
scene.cycles.samples = 48
scene.cycles.use_denoising = False
scene.render.resolution_x = scene.render.resolution_y = 400
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "PNG"
scene.render.film_transparent = True
scene.render.filepath = "/tmp/lernhub-orbit-model-poster.png"
bpy.ops.render.render(write_still=True)

# Render accessory thumbnails from the actual attachment geometry.
variants = {
    "body-mercury": None, "eyes-dual": "Lens_", "expression-smile": "Face_happy",
    "crystals-satellite": "Accessory_crystals", "rings-holo": "Accessory_ring",
    "crown-stellar": "Accessory_stellar", "particles-stardust": "Accessory_particles",
    "companion-indigo": None, "garden-flower-crown": "Accessory_garden",
}
for id, prefix in variants.items():
    for obj in bpy.data.objects:
        if obj.name.startswith(("Accessory_", "Lens_")):
            obj.hide_render = not (prefix and obj.name.startswith(prefix))
        if obj.name.startswith("Eye_"):
            obj.hide_render = id == "eyes-dual"
        if obj.name.startswith("Face_"):
            obj.hide_render = obj.name != ("Face_happy" if id == "expression-smile" else "Face_neutral")
    shader = PEARL.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = ((.67,.74,.81,1) if id=="body-mercury"
        else (.24,.36,.68,1) if id=="companion-indigo" else (.83,.73,.53,1))
    shader.inputs["Metallic"].default_value = .66 if id=="body-mercury" else .23
    scene.cycles.samples = 20
    scene.render.resolution_x = scene.render.resolution_y = 240
    scene.render.filepath = "/tmp/lernhub-" + id + "-accessory.png"
    bpy.ops.render.render(write_still=True)
