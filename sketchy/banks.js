export const WHEELS = ['Subject', 'Setting', 'Mood', 'Creative Twist', 'Artistic Style', 'Action', 'Genre'];
export const REQUIRED = WHEELS.slice(0, 3);
export const MEDIUM_CUE = 'Use it, adapt it, or ask me to spin again.';

export const STARTERS = {
  Subject: [
    'A chipped teacup', 'A rain boot with a split seam', 'A paper crown with a bent point',
    'A key with a frayed ribbon', 'A pigeon with one white wing', 'A tailor with a pincushion bracelet',
    'A fox with muddy paws', 'A diver with a fogged mask', 'A fish with a window in its belly',
    'A snail carrying a little greenhouse', 'A coat with a thundercloud in one pocket',
    'A candle with a flame made of thread', 'A glass marble with a yellow spiral',
    'A spool of bright red thread', 'A lemon with its leaf still attached', 'A cactus with one pink blossom',
    'A beekeeper with flowers tucked into one boot', 'A heron with a ribbon caught on its foot',
    'A cyclist with a bouquet in their basket', 'A crab wearing half a walnut shell',
    'A moth with stained-glass wings', 'A matchbox with a tiny staircase inside',
    'A houseplant with handwritten leaves', 'A goldfish with a constellation on its scales',
  ],
  Setting: [
    'A flower market under striped awnings', 'A roller rink under a mirror ball',
    'A public pool with bright lane ropes', 'A pottery studio with shelves of drying bowls',
    'A laundromat after closing', 'A ferry terminal at low tide', 'A rooftop garden between two chimneys',
    'A motel courtyard with an empty pool', 'A train station inside a whale skeleton',
    'A stairwell where rain falls upward', 'A library with a river running between the shelves',
    'A greenhouse suspended under a bridge',
  ],
  Mood: [
    'Tender', 'Playful', 'Eerie', 'Defiant', 'Serene', 'Joyful', 'Tense', 'Weary',
    'Wistful', 'Mischievous', 'Ominous', 'Hopeful', 'Somber', 'Curious', 'Lonely', 'Triumphant',
    'Dreamy', 'Giddy', 'Restless', 'Awestruck', 'Melancholy', 'Cozy', 'Unsettling', 'Exuberant',
  ],
  'Creative Twist': [
    'Give something the wrong shadow', 'Hide a tiny face somewhere in the image',
    'Make one thing look like it’s floating', 'Turn one ordinary detail into a tiny doorway',
    'Give something soft the look of stone', 'Let one color show up in just one spot',
    'Include a reflection that gets one detail wrong', 'Give an inanimate object a little attitude',
    'Make one thing look as if it’s made of folded paper', 'Repeat a shape in three different sizes',
    'Draw it by hand on paper | ' + MEDIUM_CUE, 'Paint it with physical paint | ' + MEDIUM_CUE,
    'Hide a tiny Olaf somewhere in the artwork', 'Hide a bunny somewhere in the artwork',
  ],
  'Artistic Style': [
    'The Princess Bride–inspired | Warm storybook light and a sweeping, theatrical silhouette.',
    'Die Hard–inspired | Hard shadows, cool window light, and a flash of red.',
    'Art Nouveau | Flowing curves and a decorative border.',
    'Woodcut-inspired | Bold silhouettes and scratchy highlights.',
    'Ink wash | Soft pools of tone with a few crisp edges.',
    'Geometric | Build the image from simple shapes and flat color.',
    'Gesture sketch | Loose, energetic lines that catch the main shape.',
    'Cut-paper collage | Overlapping shapes with crisp edges and visible layers.',
  ],
  Action: ['Unfolding', 'Drifting', 'Reaching', 'Balancing', 'Tumbling', 'Bursting open', 'Spilling over', 'Peeking out'],
  Genre: [
    'Fantasy | Give an ordinary object one visible sign of magic.',
    'Horror | Let one detail in the scene feel unsettling.',
    'Science Fiction | Show a piece of technology that belongs to an imagined future.',
    'Mystery | Place one clue where the viewer can spot it.',
    'Romance | Suggest a connection through a gesture, a keepsake, or a pair of objects.',
    'Slice of Life | Catch a small, familiar moment in progress.',
    'Adventure | Give the eye somewhere to go, like a trail, an open gate, or a distant landmark.',
    'Fairy Tale | Give one object the presence of an enchanted key, a wish, or a warning.',
  ],
};
