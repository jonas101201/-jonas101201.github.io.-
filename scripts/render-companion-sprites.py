"""Rasterize companion models for the 2D runtime. Run in Blender from repo root."""
from os import environ
from pathlib import Path
import sys
import bpy
from mathutils import Vector
from importlib import import_module
sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))
make_performer = import_module("companion-choreography").make_performer

SOURCE = Path("/tmp/lernhub-companion-models")
OUTPUT = Path("/tmp/lernhub-companion-sprites")
OUTPUT.mkdir(parents=True, exist_ok=True)
CHARACTERS = {
    "orbit": ("proud", "curious"), "ember": ("excited", "surprised"),
    "spectre": ("happy", "thoughtful"), "bloom": ("happy", "curious"),
    "glitch": ("proud", "focused"), "cosmo": ("excited", "surprised"),
    "pflanziska": ("happy", "curious"),
}

def aim(obj, point):
    obj.rotation_euler = (Vector(point) - obj.location).to_track_quat("-Z","Y").to_euler()

def make_camera(scenario):
    scene=bpy.context.scene
    bpy.ops.object.camera_add(location=(2.75,-7,3.0))
    camera=bpy.context.object
    aim(camera,(0,0,1.27 if scenario=="pflanziska" else 1.18))
    camera.data.type="ORTHO";camera.data.ortho_scale=2.88
    scene.camera=camera
    for loc,energy,color in [((-3,-4,5),710,(1,.89,.75)),((3,-3,3),390,(.78,.92,1)),((2,3,5),730,(.82,.91,1))]:
        bpy.ops.object.light_add(type="AREA",location=loc)
        obj=bpy.context.object
        obj.data.energy,obj.data.color,obj.data.size=energy,color,4
        aim(obj,(0,0,1.1))
    scene.world.color=(.27,.27,.27)
    scene.render.engine="CYCLES";scene.cycles.samples=14
    scene.cycles.use_denoising=False
    scene.render.resolution_x=scene.render.resolution_y=176
    scene.render.resolution_percentage=100
    scene.render.image_settings.file_format="PNG"
    scene.render.film_transparent=True
    return scene

def render(scene,path):
    scene.render.filepath=str(OUTPUT/(path+".png"))
    bpy.ops.render.render(write_still=True)

for character,(celebrate,greet) in CHARACTERS.items():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    bpy.ops.import_scene.gltf(filepath=str(SOURCE/(character+".glb")))
    geometry=list(bpy.context.scene.objects)
    root=bpy.data.objects.new("Character pivot",None);bpy.context.collection.objects.link(root)
    for obj in geometry:
        if obj.parent is None: obj.parent=root
    scene=make_camera(character)

    eyes=[o for o in geometry if o.name.startswith("Eye_") and o.type=="MESH"]
    bpy.context.view_layer.update()
    perform = make_performer(character, root, geometry, eyes)
    def style(stage,expression,accessory=None):
        for obj in geometry:
            n=obj.name
            obj.hide_render=False
            if n.startswith("Stage"):obj.hide_render=int(n[5])>stage
            elif n.startswith("Accessory_"):obj.hide_render=not accessory or not n.startswith(accessory)
            elif n.startswith("Lens_"):obj.hide_render=accessory!="Lens_"
            elif n.startswith("Eye_"):obj.hide_render=accessory=="Lens_"
            elif n.startswith("Face_"):obj.hide_render=n!="Face_"+expression
    if environ.get("COMPANION_EXTRA_EXPRESSIONS") == "1":
        for stage in range(4):
            for expression in ("excited","curious","focused","surprised","proud","thoughtful"):
                for lens in (False, True):
                    style(stage, expression, "Lens_" if lens else None)
                    render(scene,f"{character}-stage-{stage}-"+("dual-" if lens else "")+expression)
        continue

    stage_motions = environ.get("COMPANION_STAGE_MOTIONS") == "1"
    if environ.get("COMPANION_MOTION_ONLY") != "1" and not stage_motions:
        for stage in (1,2,3):
            style(stage,"neutral")
            render(scene,f"{character}-stage-{stage}")
        overlays={"rings-holo":"Accessory_ring", "crystals-satellite":"Accessory_crystals",
            "particles-stardust":"Accessory_particles","crown-stellar":"Accessory_stellar",
            "garden-flower-crown":"Accessory_garden"}
        for item,prefix in overlays.items():
            for obj in geometry: obj.hide_render=not obj.name.startswith(prefix)
            render(scene,f"{character}-{item}")
        for stage in range(4):
            for suffix,expression,part in [("dual","neutral","Lens_"),("smile","happy",None),("dual-smile","happy","Lens_")]:
                style(stage,expression,part)
                render(scene,f"{character}-stage-{stage}-{suffix}")
    if stage_motions:
        scene.cycles.samples=8
    for stage in (range(1,4) if stage_motions else (0,)):
        for action,expression in [("idle","neutral"),("greet",greet),("celebrate",celebrate)]:
            style(stage,expression)
            for i in range(12):
                perform(action,i/11)
                prefix = f"{character}-stage-{stage}" if stage else character
                render(scene,f"{prefix}-{action}-{i}")
