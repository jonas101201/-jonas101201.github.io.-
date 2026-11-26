"""Character-specific stage directions for the sprite renderer."""
from math import cos, pi, sin
import bpy
from mathutils import Euler, Matrix, Vector


def key(t, points):
    """Interpolate between timed pose values with a smooth stop at each key."""
    for (start, value), (end, target) in zip(points, points[1:]):
        if t <= end:
            x = max(0, min(1, (t - start) / (end - start)))
            return value + (target - value) * x * x * (3 - 2 * x)
    return points[-1][1]


def make_performer(character, root, geometry, eyes):
    parts = [(obj, obj.matrix_world.copy()) for obj in geometry]
    anchors = {}
    for obj, matrix in parts:
        if obj.name.startswith(('NarrowLeaf', 'SmallShoot')) and obj.type == 'MESH' and obj.data.vertices:
            anchors[obj.name] = matrix @ obj.data.vertices[0].co

    def move(obj, matrix, delta=(0,0,0), rot=(0,0,0), pivot=None, stretch=(1,1,1)):
        point = Vector(pivot) if pivot is not None else matrix.translation
        rotation = Euler(rot).to_matrix().to_4x4()
        scale = Matrix.Diagonal(Vector((*stretch,1)))
        obj.matrix_world = Matrix.Translation(Vector(delta) + point) @ rotation @ scale @ Matrix.Translation(-point) @ matrix

    def orbit(action, t):
        attention = key(t, [(0,0),(.24,1),(.55,1),(.78,-.35),(1,0)])
        lift = key(t, [(0,0),(.25,.03),(.54,.11),(.78,.04),(1,0)]) if action == 'celebrate' else 0
        tilt = attention * (.08 if action == 'greet' else .025)
        for obj, matrix in parts:
            if obj.name.startswith('Antenna'):
                move(obj, matrix, rot=(0,.12*attention,-.39*attention), pivot=(-.44,-.04,1.73))
            elif obj.name.startswith(('Flipper','HingePin')) and action == 'celebrate':
                side = -1 if '_L' in obj.name else 1
                move(obj, matrix, rot=(0,side*.32*max(attention,0),0), pivot=(side*.69,-.06,1.04))
        root.rotation_euler.y = tilt
        root.location.z = lift

    def ember(action, t):
        beat = key(t, [(0,0),(.17,1),(.32,.18),(.51,.89),(.68,.30),(.80,.62),(1,0)])
        strength = {'idle':.39,'greet':.8,'celebrate':1.0}[action]
        for i,(obj,matrix) in enumerate(parts):
            if obj.name.startswith(('FlameTongue','CalderaSeam')):
                lick = beat * (.7 + .3 * cos(t*8*pi+i))
                move(obj,matrix,rot=(0,.19*lick*strength*(-1 if i%2 else 1),0),
                     pivot=(matrix.translation.x,.13,.57),stretch=(1-.17*lick,1,1+.19*lick*strength))
            if obj.name.startswith('Accessory_particles') and action == 'celebrate':
                obj.hide_render = not .13 < t < .88
                move(obj,matrix,delta=(.15*sin(t*pi+i),-.15,.96*t))
        root.scale.z = 1 + .045 * beat * strength

    def spectre(action,t):
        if action == 'idle':
            glide, rise = .10*sin(2*pi*t), .06*sin(pi*t)
        elif action == 'greet':
            glide = key(t,[(0,0),(.35,-.22),(.65,.21),(1,0)])
            rise = .12*sin(pi*t)
        else:
            glide = key(t,[(0,0),(.31,.33),(.65,.12),(1,0)])
            rise = key(t,[(0,0),(.27,.21),(.63,.21),(1,0)])
        for i,(obj,matrix) in enumerate(parts):
            if obj.name.startswith(('Scallop','Sleeve')):
                move(obj,matrix,delta=(.07*sin(t*2*pi+i)*sin(pi*t),0,.12*sin(pi*t)),
                     rot=(0,.20*sin(t*3*pi+i)*sin(pi*t),0))
        root.location.x,root.location.z=glide,rise
        root.rotation_euler.y = -.25*glide

    def bloom(action,t):
        bud = key(t, [(0,0),(.22,-.3),(.60,1),(.81,.76),(1,0)])
        amount={'idle':.31,'greet':.72,'celebrate':1.0}[action]
        for i,(obj,matrix) in enumerate(parts):
            if obj.name.startswith('Petal'):
                edge=matrix.translation-Vector((0,-.13,1.34))
                opening=key(t,[(0,0),(.20,-.25),(.63,1),(.8,.87),(1,0)])*amount
                move(obj,matrix,delta=tuple(edge*.24*opening),
                     rot=(0,.22*opening*sin(i*1.3),0),stretch=(1+.11*opening,1,1+.09*opening))
            elif obj.name.startswith(('ShoulderLeaf','RootLeaf')):
                move(obj,matrix,rot=(0,.21*bud*amount*(-1 if i%2 else 1),0),pivot=(0,0,.53))
        root.rotation_euler.y=.055*bud*amount

    def glitch(action,t):
        direction=key(t,[(0,0),(.18,1),(.37,1),(.51,-1),(.68,-1),(.82,0),(1,0)])
        amount={'idle':.32,'greet':.78,'celebrate':1.0}[action]
        for obj,matrix in parts:
            if obj.name.startswith(('HeadShroud','Screen','Pivot','Face_','Eye_','Lens_')):
                shift=direction*.065*amount if obj.name.startswith(('Eye_','Lens_')) else 0
                move(obj,matrix,delta=(shift,0,0),rot=(0,0,.37*direction*amount),pivot=(0,0,1.48))
            if obj.name.startswith('Hand') and action=='celebrate':
                side=-1 if matrix.translation.x < 0 else 1
                up=key(t,[(0,0),(.36,0),(.54,1),(.74,1),(1,0)])
                move(obj,matrix,delta=(side*.09*up,0,.16*up),rot=(0,side*.42*up,0))

    def cosmo(action,t):
        cycle = 2*pi*t
        sweep = {'idle':.26,'greet':.54,'celebrate':1.0}[action]
        for i,(obj,matrix) in enumerate(parts):
            if obj.name.startswith(('LittleMoon','MoonRim')):
                move(obj,matrix,delta=(sweep*.74*(cos(cycle)-1),sweep*.51*sin(cycle),sweep*.22*sin(cycle)))
            if obj.name.startswith(('SmallComet','CometTail')):
                move(obj,matrix,delta=(sweep*.37*(1-cos(cycle)),sweep*.28*sin(cycle),sweep*.15*sin(cycle)))
            if obj.name.startswith('OuterRim') and action=='celebrate':
                move(obj,matrix,rot=(0,.21*sin(pi*t),0),pivot=(0,0,1.24))
        root.location.z=.03*sin(pi*t)

    def pflanziska(action,t):
        amplitude={'idle':.29,'greet':.69,'celebrate':1.0}[action]
        for i,(obj,matrix) in enumerate(parts):
            name=obj.name
            if name in anchors:
                gust=sin(t*pi)*sin(t*2*pi+i*.31)
                move(obj,matrix,rot=(.18*gust*amplitude,.29*gust*amplitude,.045*gust*amplitude),pivot=anchors[name])
            if name.startswith(('Thread','PaperTag')):
                tag = int(name[-1]) if name[-1].isdigit() else 0
                pos=[(-.40,-.31,2.08),(.17,-.25,2.0),(.39,-.13,1.58)][tag % 3]
                swing=sin(t*pi)*sin(t*4*pi+tag*.92)
                move(obj,matrix,rot=(.33*swing*amplitude,.17*swing*amplitude,0),pivot=pos)

    direct = {
        'orbit':orbit, 'ember':ember, 'spectre':spectre, 'bloom':bloom,
        'glitch':glitch, 'cosmo':cosmo, 'pflanziska':pflanziska,
    }[character]

    def perform(action,t):
        root.location=(0,0,0); root.rotation_euler=(0,0,0); root.scale=(1,1,1)
        bpy.context.view_layer.update()
        for obj,matrix in parts:
            obj.matrix_world=matrix
        direct(action,t)
        blink_at={'orbit':.37,'ember':.52,'spectre':.28,'bloom':.47,'glitch':.62,'cosmo':.75,'pflanziska':.40}[character]
        for eye in eyes:
            if eye.data.shape_keys and (blink := eye.data.shape_keys.key_blocks.get('EyeBlink')):
                blink.value=max(0,1-abs(t-blink_at)*12)
    return perform
