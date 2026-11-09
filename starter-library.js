import {princessLibrary,originalPerspectives} from './princess-library.js';
import {parseEntries,normalize} from './core.js';
import {legacyStarters} from './legacy-starters.js';
const words=text=>[...new Set(text.split(',').map(s=>s.trim()).filter(Boolean))].map(name=>({name,description:''}));
const entries=text=>parseEntries(text);
const baseLibrary=[
{name:'The Royal Collection',type:'Words',entries:words(`Velvet,Whisper,Crown,Midnight,Thorn,Secret,Lantern,Promise,Storm,Ember,Ribbon,Mirror,Wander,Spell,Garden,Rebellion,Moonlight,Key,Masquerade,Dragon,Honey,Ghost,Silver,Wildflower,Ruins,Letter,Dagger,Wish,Ocean,Starlight,Betrayal,Tea,Castle,Feather,Dawn,Fable,Amber,Anchor,Apology,Apple,Arrow,Ash,Attic,Autumn,Balcony,Ballad,Bargain,Beacon,Bell,Birdsong,Blackmail,Blizzard,Bloom,Blush,Bookshop,Bottle,Boundary,Bridge,Brook,Butterfly,Cage,Candlelight,Canvas,Captain,Caravan,Cathedral,Chalice,Charm,Chess,Chimney,Clockwork,Cloak,Clue,Comet,Compass,Confession,Constellation,Contract,Coral,Courtyard,Cradle,Crimson,Crossroads,Crystal,Curiosity,Curtain,Dance,Dandelion,Debt,Delight,Desert,Destiny,Diamond,Diary,Disguise,Doorway,Doubt,Dream,Drought,Echo,Eclipse,Emerald,Envelope,Escape,Exile,Fairytale,Falcon,Farewell,Favor,Festival,Firefly,Fog,Footprint,Forbidden,Forest,Forgiveness,Fountain,Fox,Freedom,Frost,Galaxy,Gambit,Garnet,Gate,Gaze,Gemstone,Gilded,Glacier,Glass,Glove,Gold,Gossip,Grace,Guardian,Guilt,Harbor,Harmony,Harvest,Hearth,Heirloom,Hesitation,Hideaway,Horizon,Hush,Ink,Invitation,Island,Ivory,Ivy,Jade,Jealousy,Jewel,Journey,Justice,Kettle,Kingdom,Kiss,Knot,Lace,Lake,Last,Laughter,Lavender,Legacy,Lemon,Library,Lightning,Lilac,Locket,Longing,Lullaby,Map,Marble,Market,Mask,Meadow,Memory,Merchant,Mischief,Moonflower,Moth,Mountain,Murmur,Mystery,Nectar,Needle,Nightingale,North,Notebook,Oath,Obsidian,Olive,Opal,Orchard,Origami,Outlaw,Overture,Palace,Parchment,Patience,Pearl,Perfume,Petal,Piano,Pilgrim,Portrait,Postcard,Potion,Prison,Prophecy,Quill,Rain,Ransom,Raven,Recipe,Reckoning,Refuge,Regret,Relic,Riddle,Ring,River,Road,Rose,Ruby,Rumor,Sacrifice,Saffron,Sapphire,Scandal,Scar,Scholar,Sea,Seashell,Secrecy,Serenade,Shadow,Shipwreck,Silence,Silk,Smoke,Song,Sparrow,Spindle,Spiral,Spring,Staircase,Statue,Stillness,Stranger,Stubborn,Sunrise,Swallow,Sword,Tapestry,Tempest,Threshold,Thunder,Tide,Token,Tower,Trail,Treasure,Treaty,Truce,Trust,Twilight,Undertow,Unravel,Valley,Vanishing,Vow,Wake,Waterfall,Wax,Wedding,Well,Wild,Willow,Window,Wing,Winter,Witness,Wolf,Wound,Yearning,Yesterday,Zephyr`)},
{name:'Halloween',type:'Words',entries:words(`Haunted,Pumpkin,Witch,Cobweb,Graveyard,Specter,Cauldron,Raven,Fangs,Candle,Apparition,Banshee,Bat,Black cat,Bone,Boogeyman,Broomstick,Casket,Cemetery,Costume,Crypt,Curse,Demon,Doppelganger,Eerie,Familiar,Full moon,Gargoyle,Ghoul,Goblin,Grimoire,Headless,Hollow,Howl,Jack-o-lantern,Labyrinth,Macabre,Mausoleum,Necromancer,Nightmare,October,Ouija,Phantom,Poltergeist,Possession,Reaper,Ritual,Scarecrow,Seance,Shadow,Skeleton,Skull,Spider,Spirit,Superstition,Tombstone,Trick,Treat,Vampire,Werewolf`)},
{name:'Thanksgiving',type:'Words',entries:words(`Harvest,Gratitude,Feast,Homecoming,Cranberry,Hearth,Orchard,Gathering,Cornucopia,Abundance,Acorn,Apron,Autumn,Apple pie,Baking,Barn,Bonfire,Bread,Casserole,Centerpiece,Cider,Cinnamon,Clove,Comfort,Company,Cornbread,Cozy,Family,Foliage,Football,Forgiveness,Frost,Generosity,Gravy,Guest,Hayride,Heirloom,Hospitality,Invitation,Journey,Kinship,Kitchen,Leaf,Leftovers,Maple,November,Nutmeg,Patchwork,Pecan,Pilgrimage,Potluck,Pumpkin,Recipe,Reunion,Roast,Rustic,Tablecloth,Tradition,Welcome,Wishbone`)},
{name:'Christmas',type:'Words',entries:words(`Mistletoe,Snowfall,Evergreen,Sleigh,Gift,Gingerbread,Carol,Holly,Frost,Advent,Angel,Bell,Blizzard,Bow,Candlelight,Candy cane,Chimney,Cocoa,Cookie,December,Ember,Family,Fir,Fireplace,Flurry,Garland,Generosity,Glitter,Goodwill,Homecoming,Icicle,Jingle,Joy,Kindness,Lantern,Midwinter,Miracle,Mittens,Nativity,Noel,North pole,Nutcracker,Ornament,Package,Peppermint,Pinecone,Reindeer,Ribbon,Scarf,Secret Santa,Silver,Skating,Snowflake,Snowman,Solstice,Star,Stocking,Tinsel,Tradition,Wreath`)},
{name:'Potions',type:'Potions',entries:entries(`Truth Serum | Your character cannot tell a lie for one scene.
Liquid Courage | Attempt the thing your character fears most.
Memory Mist | An important memory disappears.
Curse of Sorrows | Every happy memory brings an unexpected tear.
Borrowed Luck | One impossible success creates a smaller disaster elsewhere.
Bottled Dawn | A sleepless character suddenly has boundless energy at the worst time.
Velvet Voice | Every request sounds like an irresistible invitation.
Second Chance | Repeat one conversation with knowledge of how it ended.
Invisible Ink | A secret appears on your character's skin.
Dreamwalker's Draught | Enter someone else's dream and leave evidence behind.
Heart's Compass | Your character can sense the direction of their deepest desire.
Echo Elixir | The last sentence spoken returns in another person's voice.
Moonlit Mercy | An enemy needs your character's protection until sunrise.
Borrowed Face | A stranger mistakes your character for someone they desperately need.
Dragon's Warmth | Your character's touch melts something they meant to preserve.
Time in a Teacup | One minute stretches long enough for an impossible decision.
Tangled Tongue | An apology emerges as a love confession.
Starlight Sip | A small forgotten object becomes brilliantly important.
Golden Silence | Your character cannot speak but must deliver urgent news.
Potion of Plenty | A needed resource multiplies far beyond what anyone can handle.
Wildflower Tonic | Something beautiful grows wherever your character stands still.
Unfinished Business | A departed voice asks for one final favor.
Glass Heart | Your character's emotions become visible to everyone nearby.
Tide Turner | A trusted plan suddenly works for the opposing side.
Featherlight | Your character loses something they usually take for granted.
Thread of Fate | Two strangers must remain within arm's reach for one scene.
Ember Essence | An old ambition rekindles at a very inconvenient moment.
Mirror Milk | Your character briefly sees themselves through someone else's eyes.
Wishwater | A careless wish comes true with one awkward condition.
Midnight Bloom | A hidden talent appears only after dark.`)},
{name:'Poisons',type:'Poisons',entries:entries(`Poison of Grumbling | A complaint reaches the ears of the person it concerns.
Poison of Exaggeration | A detail grows more impressive every time it is repeated.
Poison of Echoes | A character accidentally repeats a secret aloud.
Violet Vendetta | Your character becomes absurdly competitive over something trivial.
Green-Eyed Draught | An innocent gesture looks like a betrayal.
Bitter Courtesy | Every compliment comes out as a backhanded insult.
False Confidence | Your character is certain of a fact that is completely wrong.
Whisper Rot | A harmless rumor turns into a public accusation.
Vanishing Alibi | The only witness forgets your character was there.
Inkblot Doubt | A perfectly clear message suddenly seems suspicious.
Sweet Disaster | A well-meant gift causes an embarrassing catastrophe.
Crimson Hiccup | Your character hiccups whenever they conceal the truth.
Pride's Price | Accepting help feels harder than facing the danger alone.
Paper Crown | An unearned title brings very real responsibilities.
Hollow Victory | Getting exactly what they wanted costs a friendship.
Tanglethorn | Every attempt to explain makes the misunderstanding worse.
Silver Spite | Your character must praise their least favorite person sincerely.
Stolen Spotlight | Someone else receives credit for your character's best idea.
Rumor Honey | People believe the least plausible story about your character.
Bad Timing | A long-awaited confession arrives during a crisis.
Wounded Vanity | A ridiculous criticism becomes impossible to forget.
Crooked Compass | Your character's excellent advice leads everyone astray.
Unwelcome Honesty | An involuntary confession reveals a petty resentment.
Velvet Grudge | Your character cannot remember why they dislike someone.
Fickle Fortune | Every easy solution produces a new inconvenience.
Cracked Halo | A heroic gesture exposes an embarrassing secret.
Restless Shadow | Your character's shadow seems to disapprove of their choices.
False Farewell | Everyone thinks your character is leaving for good.
Bottled Regret | A past mistake must be explained to the person it hurt.
Last Laugh | A practical joke lands on its own inventor.`)},
{name:'Magic Mirror',type:'Magic Mirror',entries:entries(`The Other Side | Your character must defend a rival's point of view sincerely.
Unmasked | Your character reveals a secret they planned to keep forever.
Reflection | Your character meets an alternate version of themselves.
No Wink Left | Your character cannot wink and keeps trying at the worst moments.
Formal Introductions | Your character uses full titles even with their closest friend.
Butterfingers | Your character drops the one object they promised to protect.
Unexpected Softness | Your toughest character cries over something very small.
Wrong Name | Your character repeatedly calls an important person the wrong name.
Secret Collector | Your character has an embarrassing collection they adore.
Stage Fright | Your confident character freezes when all eyes turn toward them.
Accidental Poet | Your character can only confess their feelings in rhyme.
Terrible Liar | Every lie makes your character blush spectacularly.
No Directions | Your character cannot admit that they are lost.
Borrowed Bravery | Your character imitates someone else's courage and gets caught.
Unwanted Nickname | A nickname your character hates becomes wildly popular.
Hidden Talent | Your character is unexpectedly excellent at a ridiculous skill.
Bad Applause | Your character claps at exactly the wrong moment.
Overprepared | Your character packs for every emergency except the actual one.
Tiny Nemesis | Your character is outwitted by a small animal.
Two Left Feet | Your character must dance despite having no sense of rhythm.
Honest Answer | Your character answers a polite question far too honestly.
Personal Space | Your character must ask someone for a hug.
A Small Fear | Your formidable character admits a very ordinary phobia.
Unsent Letter | Your character's private draft reaches its intended recipient.
Bad First Impression | Your character must repair a spectacularly awkward introduction.
Reluctant Mentor | Your impatient character must teach someone their best skill.
Unexpected Admirer | Your character's least impressive habit inspires somebody.
Forgotten Birthday | Your character must improvise a meaningful celebration.
The Apology | Your character apologizes without explaining away the fault.
Unfashionable | Your character must wear something they find mortifying.
Involuntary Smile | Your character cannot maintain their intimidating expression.
Wrong Pocket | Your character produces an embarrassing object instead of the needed one.
Silence Please | Your talkative character must get through a scene without speaking.
One Favor | Your independent character must ask their rival for help.
Bad at Goodbye | Your character keeps finding excuses not to leave.
Stubborn Kindness | Your character helps someone while insisting they do not care.
Secret Sweet Tooth | Your character goes to absurd lengths for a favorite treat.
Meet Yourself | Your character hears their own worst advice repeated back to them.
Unwanted Praise | Your character must accept a compliment gracefully.
Change of Heart | Your character admits they were wrong in front of an audience.`)},
{name:'Genre Genie',type:'Genre Genie',entries:entries(`Cozy mystery | A gentle puzzle in a close-knit community.
Space opera | A sweeping adventure among the stars.
Gothic romance | Love and dread in a haunting setting.
High fantasy | Epic stakes in a richly imagined magical world.
Urban fantasy | Magic hides within a recognizable modern city.
Romantasy | A romantic relationship and a fantasy conflict shape each other.
Fairy-tale retelling | Reimagine a familiar tale with an unexpected viewpoint.
Dark fantasy | Wonder comes with a frightening price.
Sword and sorcery | Personal quests, dangerous magic, and daring action.
Historical fantasy | Let magic disrupt a specific period of history.
Magical realism | Treat an impossible detail as part of ordinary life.
Science fantasy | Technology and magic coexist.
Hard science fiction | A scientific constraint drives the central problem.
First contact | Encounter an intelligence with unfamiliar assumptions.
Cyberpunk | Advanced technology collides with inequality and street-level survival.
Solarpunk | Imagine a hopeful, sustainable community facing a real challenge.
Dystopian fiction | A controlling society forces a personal moral choice.
Post-apocalyptic | Build a life among the remains of a changed world.
Time travel | A journey through time creates a difficult consequence.
Alternate history | Change a historical turning point and follow the effects.
Steampunk | Inventive machinery reshapes an industrial-era adventure.
Detective mystery | Follow clues, suspects, and a revealing deduction.
Locked-room mystery | Solve a crime that appears physically impossible.
Noir | A compromised investigator navigates corruption and temptation.
Heist | A specialized crew attempts an audacious theft.
Spy thriller | Secrets, divided loyalties, and hidden agendas collide.
Psychological thriller | Uncertainty about perception makes trust dangerous.
Legal thriller | Evidence and persuasion determine a high-stakes dispute.
Adventure | Pursue a dangerous goal through unfamiliar territory.
Western | Test loyalty and justice on a contested frontier.
Historical fiction | Ground a personal conflict in a researched past.
Contemporary romance | Build a relationship through present-day obstacles.
Romantic comedy | Let attraction and comic misunderstandings complicate each other.
Paranormal romance | An otherworldly bond creates very human complications.
Second-chance romance | Former partners face what separated them.
Folk horror | A community's old customs conceal a threat.
Cosmic horror | Discover something that exceeds human understanding.
Ghost story | The past refuses to remain absent.
Satire | Expose an absurd institution through exaggeration.
Coming of age | A formative choice changes a character's understanding of themselves.`)}
];
const major=`The Fool|New beginnings, curiosity, and a leap into the unknown.|Impulsive risks or fear of taking the first step.
The Magician|Skill, intention, and the power to put an idea into action.|Manipulation or talents left unused.
The High Priestess|Intuition, quiet knowledge, and secrets beneath the surface.|Ignoring intuition or discovering a concealed truth.
The Empress|Nurturing, creativity, and abundant growth.|Creative depletion or care that becomes smothering.
The Emperor|Structure, authority, and protective leadership.|Rigid control or a failure to hold a needed boundary.
The Hierophant|Tradition, shared beliefs, and guidance from a teacher.|Questioning convention and choosing a personal path.
The Lovers|Connection, shared values, and a meaningful choice.|Conflicting values or a relationship out of balance.
The Chariot|Determination and progress through disciplined effort.|Competing impulses pull a journey off course.
Strength|Patient courage, compassion, and gentle self-command.|Self-doubt or frustration overwhelms quiet courage.
The Hermit|Solitude offers insight and a clearer inner compass.|Isolation goes too far or needed reflection is avoided.
Wheel of Fortune|A changing cycle brings an unexpected turning point.|Resistance to change or a troublesome repeating pattern.
Justice|Accountability, fairness, and the consequences of a choice.|Bias, evasion, or an unfair judgment demands attention.
The Hanged Man|Pause, surrender, and a radically different perspective.|Stalling or sacrifice that no longer serves a purpose.
Death|An ending makes room for a profound transformation.|Clinging to what is over delays necessary change.
Temperance|Balance, patience, and the blending of differences.|Excess or clashing priorities disrupt a fragile balance.
The Devil|Attachment, temptation, and patterns that limit freedom.|Recognizing a harmful bond and beginning to break it.
The Tower|A sudden upheaval exposes an unstable foundation.|A feared collapse is delayed or an inner upheaval begins.
The Star|Renewed hope, healing, and trust in the future.|Discouragement makes it difficult to recognize hope.
The Moon|Dreams, uncertainty, and truths obscured by fear.|Confusion begins to lift or an illusion is confronted.
The Sun|Warmth, openness, joy, and a welcome success.|Joy is muted or success takes longer than expected.
Judgement|An awakening calls for honest reflection and a fresh start.|Self-criticism or avoidance delays answering a call.
The World|Completion, integration, and the satisfaction of a journey fulfilled.|An unfinished detail prevents a sense of closure.`;
const tarot=major.split('\n').map(row=>{const [name,description,reversedDescription]=row.split('|');return {name,description,reversedDescription};});
// Original, concise writing prompts using familiar suit themes, not quoted divination text.
const suits={
Wands:[['A creative spark invites a new venture.','A promising idea struggles to find momentum.'],['Plan an ambitious journey beyond familiar ground.','Fear of the unknown narrows the plan.'],['Early effort opens new horizons.','Expansion meets delays or disappointing support.'],['Celebrate a milestone with a welcoming community.','A celebration exposes tensions at home.'],['Rival ambitions create a lively contest.','A conflict is avoided or turns needlessly personal.'],['Earned recognition brings public confidence.','Praise is withheld or pride obscures the achievement.'],['Defend a hard-won position with conviction.','Overwhelm makes holding a boundary difficult.'],['Rapid developments carry an urgent message.','Haste or delay tangles a crucial communication.'],['Resilience carries a weary guardian through one more test.','Exhaustion or suspicion weakens a needed defense.'],['Responsibility becomes a heavy burden.','A burden is released or help is finally accepted.'],['An enthusiastic newcomer follows a daring idea.','Restless enthusiasm lacks direction.'],['A bold adventurer charges toward a passionate goal.','Impulsive action creates needless trouble.'],['Warm confidence inspires others to create.','Insecurity disguises itself as jealousy or control.'],['A visionary leader turns passion into a shared purpose.','Domineering ambition loses sight of the people involved.']],
Cups:[['A new emotional connection begins to overflow.','Feelings are withheld or emotional reserves need care.'],['Mutual affection creates a generous partnership.','A misunderstanding disrupts reciprocity.'],['Friendship and shared joy deserve a celebration.','Exclusion or social excess strains the group.'],['Discontent makes a new offer difficult to notice.','Apathy lifts and a fresh possibility becomes visible.'],['Grief focuses attention on what has been lost.','Acceptance reveals what remains worth protecting.'],['A memory or old kindness returns from the past.','Nostalgia prevents a needed step forward.'],['Many enticing possibilities demand discernment.','An illusion fades and a choice becomes clearer.'],['Leave a hollow success to seek deeper fulfillment.','Fear of departure keeps someone in an empty situation.'],['A heartfelt wish brings contentment.','Getting a wish does not satisfy the deeper need.'],['Emotional harmony creates a sense of belonging.','An ideal picture hides family or relationship strain.'],['A sensitive messenger offers an imaginative surprise.','Emotional immaturity distorts a sincere message.'],['A romantic idealist follows an invitation of the heart.','Beautiful promises lack consistent action.'],['Compassion and intuition offer safe emotional shelter.','Caring for others erases necessary personal boundaries.'],['Emotional maturity steadies a difficult encounter.','Unspoken feelings become manipulation or withdrawal.']],
Swords:[['A clear truth cuts through confusion.','Clouded judgment or harsh words obscure the truth.'],['A difficult choice rests in uneasy balance.','Avoidance ends or too much information overwhelms a decision.'],['A painful truth exposes a wounded heart.','Healing begins as old pain is acknowledged.'],['Rest and retreat restore a tired mind.','Restlessness interrupts recovery or burnout demands a pause.'],['Winning an argument costs something precious.','A quarrel moves toward repair or lingering resentment.'],['A difficult passage leads toward calmer ground.','Unfinished business makes moving on difficult.'],['Strategy and secrecy offer a risky advantage.','A deception is exposed or honesty becomes unavoidable.'],['Limiting beliefs make a character feel trapped.','A new perspective reveals a way out.'],['Anxiety magnifies a fear in the quiet hours.','Sharing a fear begins to loosen its hold.'],['A painful ending leaves no room for denial.','Recovery starts after the worst has passed.'],['A curious observer asks a sharp question.','Hasty assumptions or gossip distort the evidence.'],['A determined challenger pursues an urgent truth.','Reckless certainty rushes past a crucial detail.'],['Clear boundaries and independent judgment protect what matters.','Bitterness or rigid judgment closes the door to understanding.'],['A principled strategist makes a reasoned decision.','Cold authority or misuse of logic silences someone.']],
Pentacles:[['A practical opportunity offers a promising beginning.','A missed opportunity calls for a more grounded plan.'],['Flexibility keeps competing responsibilities in motion.','Too many commitments upset the balance.'],['Different skills combine in careful teamwork.','Poor coordination or unrecognized effort weakens the project.'],['Security is protected through careful stewardship.','Fearful possessiveness loosens or generosity becomes possible.'],['Hardship leaves someone feeling outside the warmth.','Support appears and a period of hardship begins to ease.'],['Resources are shared through generosity and exchange.','Unequal giving creates dependence or resentment.'],['Patient effort waits for a slow-growing reward.','Impatience raises questions about the value of continued effort.'],['Practice and craftsmanship refine an important skill.','Perfectionism or careless repetition drains the work of purpose.'],['Independence and steady effort create material comfort.','Appearances of success conceal insecurity or dependence.'],['Legacy and shared resources anchor a lasting community.','An inheritance or family expectation becomes a source of conflict.'],['A diligent learner begins a tangible new project.','Procrastination keeps a useful idea from taking shape.'],['Reliable effort moves steadily toward a practical goal.','Routine becomes stagnation or stubbornness.'],['Resourceful care makes a home or project flourish.','Overwork leaves the caretaker with too little for themselves.'],['Responsible stewardship turns experience into lasting stability.','Status or possessiveness takes priority over wise leadership.']]
};
const ranks=['Ace','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Page','Knight','Queen','King'];
for(const [suit,meanings] of Object.entries(suits))meanings.forEach(([description,reversedDescription],i)=>tarot.push({name:`${ranks[i]} of ${suit}`,description,reversedDescription}));
baseLibrary.splice(4,0,{name:'Tarot',type:'Tarot',entries:tarot});
export const starterLibrary=[...baseLibrary.map(b=>princessLibrary.find(p=>p.type===b.type)||b),...princessLibrary.filter(p=>!baseLibrary.some(b=>b.type===p.type))];
export function createStarterBanks(uid){return starterLibrary.map(b=>({...structuredClone(b),id:uid()}));}
const reverseSamples={'the fool':'Careless risks, poor preparation, or misplaced trust.','the magician':'Deception, manipulation, or a gift that goes unused.','the moon':'Uncertainty begins to clear, though misunderstandings may remain.'};
function fingerprint(bank){return JSON.stringify(bank.entries.map(e=>[e.name,e.description,e.reversedDescription||'']));}
export function populateStarters(state,uid){
 state.features ||= {};
 if(state.features.starterLibraryVersion>=3)return state;
 if(state.features.starterLibraryVersion===2){
  const source=starterLibrary.find(b=>b.type==='Perspective Portal');
  const existing=state.banks.find(b=>b.type===source.type&&fingerprint(b)===fingerprint({entries:originalPerspectives}));
  if(existing)existing.entries=structuredClone(source.entries);
  else if(!state.banks.some(b=>b.type===source.type&&fingerprint(b)===fingerprint(source)))state.banks.push({...structuredClone(source),name:'Royal Library — Perspective Portal',id:uid()});
  state.features.starterLibraryVersion=3;return state;
 }
 for(const source of starterLibrary){
  const legacy=legacyStarters.find(b=>b.name===source.name&&b.type===source.type);
  if(legacy?.type==='Tarot')legacy.entries.forEach(e=>e.reversedDescription=reverseSamples[normalize(e.name)]||'');
  const existing=state.banks.find(b=>legacy&&b.name===legacy.name&&b.type===legacy.type&&(fingerprint(b)===fingerprint(legacy)||baseLibrary.some(old=>old.name===b.name&&old.type===b.type&&fingerprint(old)===fingerprint(b))));
  if(existing)existing.entries=structuredClone(source.entries);
  else if(!state.banks.some(b=>b.name===source.name&&b.type===source.type&&fingerprint(b)===fingerprint(source)))
    state.banks.push({...structuredClone(source),name:state.banks.some(b=>b.name===source.name)?`Royal Library — ${source.name}`:source.name,id:uid()});
 }
 state.features.starterLibraryVersion=3;
 return state;
}
