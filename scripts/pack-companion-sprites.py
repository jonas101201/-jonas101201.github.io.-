"""Pack Blender's transparent PNG frames as WebP layers and horizontal strips."""
from pathlib import Path
import re
from PIL import Image

FRAMES = Path("/tmp/lernhub-companion-sprites")
OUT = Path.cwd() / "public/worlds/models"
OUT.mkdir(parents=True, exist_ok=True)
CHARACTERS = ("orbit","ember","spectre","bloom","glitch","cosmo","pflanziska")
ACCESSORIES = ("rings-holo","crystals-satellite","particles-stardust","crown-stellar","garden-flower-crown")
THUMBNAILS = (*ACCESSORIES,"body-mercury","eyes-dual","expression-smile","companion-indigo")

def save(source, name, quality=88):
    with Image.open(source) as image:
        image.save(OUT / (name + ".webp"), quality=quality, method=5)

for name in CHARACTERS:
    save(FRAMES / f"{name}-idle-0.png", name+"-poster")
    for layer in ACCESSORIES:
        save(FRAMES / f"{name}-{layer}.png", name+"-"+layer)
    for file in sorted(FRAMES.glob(name+"-stage-*.png")):
        if not re.search(r"-(idle|greet|celebrate)-\d+$", file.stem):
            save(file, file.stem)
    for stage in range(4):
        prefix = f"{name}-stage-{stage}" if stage else name
        for motion in ("idle","greet","celebrate"):
            first=Image.open(FRAMES / f"{prefix}-{motion}-0.png")
            width,height=first.size
            strip=Image.new("RGBA",(width*12,height))
            for index in range(12):
                with Image.open(FRAMES / f"{prefix}-{motion}-{index}.png") as frame:
                    strip.paste(frame,(index*width,0))
            strip.save(OUT / f"{prefix}-{motion}-sprite.webp",quality=83,method=5)

for name in THUMBNAILS:
    save(Path("/tmp") / f"lernhub-{name}-accessory.png", name+"-accessory")
