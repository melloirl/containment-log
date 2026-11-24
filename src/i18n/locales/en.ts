// English. The reference locale: every other locale has the same shape.
//
// Two kinds of text live here:
//  - interface messages use vue-i18n syntax: {name} is a placeholder and
//    "one | many" is a plural pair;
//  - `abnormalities` and `notes` are read exactly as written, so any character is fine.
export default {
  app: {
    title: 'Containment log',
    tagline:
      "Your field guide to every abnormality you've met: how useful it is, how dangerous, and how much babysitting it needs.",
  },
  stats: {
    gauge: '{logged} of {total} abnormalities logged',
    logged: 'logged',
    agentsLost: 'agent lost | agents lost',
    fanClubs: 'fan club joined | fan clubs joined',
  },
  controls: {
    search: 'Search by code or name',
    filters: 'Filters',
    all: 'All',
    tools: 'Tools',
    loggedOnly: 'Logged only',
    count: '{n} unit shown | {n} units shown',
  },
  grid: {
    empty: {
      search:
        'Nothing matches that search. Try the classification code shown on the containment unit, like O-03-03.',
      risk: 'Nothing logged at this risk level yet.',
      logged: 'Your log is empty.',
      filters: 'Nothing to show with these filters.',
    },
    shieldNote:
      'Unidentified units stay hidden while you filter by risk level. Turn off the spoiler shield in Settings to see the full roster.',
  },
  unit: {
    notLogged: 'Not logged',
    unidentified: 'Unidentified',
    fan: 'Fan',
    lost: '{n} lost',
    reviewUnfinished: 'Review unfinished',
    notReviewed: 'Not reviewed yet',
  },
  file: {
    label: 'Abnormality file',
    empty: 'Open a containment unit to read its file.',
    back: 'Back to the log',
    unidentified: 'Unidentified abnormality',
    tool: 'TOOL',
    sealed:
      'All you have so far is the classification code. Its name, portrait, and risk level unlock once it is logged.',
    unlogged: 'Not logged yet. Its portrait unlocks once it is.',
    loggedOn: 'Logged on {date}',
    notes: 'Notes about {name}',
  },
  decode: {
    standard: '{origin} origin, {form} form',
    nonStandard: 'No standard code on file, tool form',
  },
  origin: {
    O: 'Original',
    T: 'Trauma',
    F: 'Fairy tale',
    D: 'Donation',
  },
  form: {
    dummy: 'training dummy',
    humanoid: 'humanoid',
    animal: 'animal',
    otherworldly: 'otherworldly',
    inanimate: 'inanimate',
    machine: 'machine or artifact',
    abstract: 'abstract',
    breaching: 'breaching tool',
    tool: 'tool',
    unknown: 'unknown',
  },
  review: {
    title: 'Performance review',
    notRated: 'Not rated',
    hint: 'Usefulness is half the score. Low danger and low management earn the rest.',
    fan: "You're a fan",
    axisLevel: '{axis}: {level}',
  },
  axis: {
    usefulness: {
      label: 'Usefulness',
      levels: { useless: 'Useless', neutral: 'Neutral', useful: 'Useful' },
    },
    danger: {
      label: 'Danger',
      levels: {
        peaceful: 'Peaceful',
        safeish: 'Safe-ish',
        neutral: 'Neutral',
        dangerous: 'Dangerous',
        extreme: 'Extremely dangerous',
      },
    },
    management: {
      label: 'Management',
      levels: { none: 'None', periodic: 'Periodic', constant: 'Constant', micromanage: 'Micromanage' },
    },
  },
  verdict: {
    pending: { call: 'No verdict yet', why: 'All three ratings are needed for a score out of 10.' },
    always: { call: 'Always pick', why: 'Low drama, high output. Promote it.' },
    good: { call: 'Good pick', why: 'Earns its containment unit.' },
    fair: { call: 'Fair trade', why: 'You get about what you put up with.' },
    desperate: { call: 'Only if desperate', why: 'The energy quota had better be worth it.' },
    never: { call: 'Never again', why: 'Not worth the agents.' },
  },
  works: {
    title: 'Work results',
    instinct: 'Instinct',
    insight: 'Insight',
    attachment: 'Attachment',
    repression: 'Repression',
    result: { good: 'goes well', bad: 'avoid', unknown: 'unknown' },
  },
  lost: {
    title: 'Agents lost to it',
    remark: {
      clean: 'A clean record. So far.',
      acceptable: 'Acceptable losses.',
      questions: 'HR has questions.',
      tooMany: 'Maybe try a different work type.',
    },
  },
  settings: {
    title: 'Settings',
    shieldName: 'Spoiler shield.',
    shieldHelp:
      "Hide the name, silhouette, and risk level of anything you haven't logged yet. You can still find a new arrival by its classification code, or by typing three or more letters of its name.",
  },
  footer: {
    about:
      'Unofficial fan-made tracker for Lobotomy Corporation by Project Moon. The roster covers the {count} released abnormalities; origin and form are read from each classification code, following the community interpretation.',
    portraits: 'In-game portraits by Project Moon.',
    gallery: 'Lobotomy Corporation Wiki portrait gallery',
  },

  /** Names by classification code. Read as written. */
  abnormalities: {
    'O-03-03': 'One Sin and Hundreds of Good Deeds',
    'F-04-83': 'Fairy Festival',
    'F-05-52': 'Opened Can of WellCheers',
    'O-01-45': 'Plague Doctor',
    'O-05-47': 'Don\'t Touch Me',
    'O-09-81': 'Mirror of Adjustment',
    'T-09-85': 'We Can Change Anything',
    'T-09-94': 'You Must Be Happy',
    'T-09-97': 'Old Faith and Promise',
    'Bald-Is-Awesome!': 'You\'re Bald...',
    'D-01-106': 'Army in Black',
    'O-00-00': 'Standard Training-Dummy Rabbit',
    'T-06-27': '1.76 MHz',
    'F-02-44': 'Beauty and the Beast',
    'O-09-96': 'Behavior Adjustment',
    'T-05-51': 'Bloodbath',
    'O-05-61': 'Crumbling Armor',
    'T-01-54': 'Forsaken Murderer',
    'O-03-60': 'Fragment of the Universe',
    'O-04-100': 'Grave of Cherry Blossoms',
    'O-09-95': 'Luminous Bracelet',
    'O-04-84': 'Meat Lantern',
    'O-01-12': 'Old Lady',
    'D-02-107': 'Ppodae',
    'O-02-56': 'Punishing Bird',
    'F-01-02': 'Scorched Girl',
    'T-09-90': 'Skin Prophecy',
    'T-02-43': 'Spider Bud',
    'T-09-77': 'The Heart of Aspiration',
    'F-01-18': 'The Lady Facing the Wall',
    'T-09-09': 'Theresia',
    'O-01-92': 'Today\'s Shy Look',
    'T-02-99': 'Void Dream',
    'T-05-41': 'All-Around Helper',
    'O-01-55': 'Child of the Galaxy',
    'F-01-69': 'Der Freischütz',
    'T-01-68': 'Funeral of the Dead Butterflies',
    'T-09-80': 'Giant Tree Sap',
    'T-04-06': 'Happy Teddy Bear',
    'O-01-67': 'Laetitia',
    'O-01-15': 'Nameless Fetus',
    'T-09-78': 'Notes from a Crazed Researcher',
    'O-02-98': 'Porccubus',
    'O-09-91': 'Portrait of Another World',
    'O-04-08': 'Red Shoes',
    'F-02-49': 'Rudolta of the Sleigh',
    'F-01-87': 'Scarecrow Searching for Wisdom',
    'O-05-76': 'Schadenfreude',
    'T-09-82': 'Shelter from the 27th of March',
    'O-05-30': 'Singing Machine',
    'F-01-37': 'The Snow Queen',
    'F-05-32': 'Warm-Hearted Woodsman',
    'T-04-53': 'Alriune',
    'D-09-104': 'Backward Clock',
    'F-02-58': 'Big and Will Be Bad Wolf',
    'O-02-40': 'Big Bird',
    'D-01-110': 'Clouded Monk',
    'O-03-88': 'Dimensional Refraction Variant',
    'F-02-70': 'Dream of a Black Swan',
    'T-09-86': 'Express Train to Hell',
    'T-09-79': 'Flesh Idol',
    'D-01-105': 'Il Pianto della Luna',
    'O-02-62': 'Judgement Bird',
    'F-01-57': 'Little Red Riding Hooded Mercenary',
    'D-04-108': 'Parasite Tree',
    'T-04-50': 'Queen Bee',
    'F-04-42': 'Snow White\'s Apple',
    'O-04-72': 'The Burrowing Heaven',
    'T-02-71': 'The Dreaming Current',
    'O-02-101': 'The Firebird',
    'O-01-64': 'The King of Greed',
    'O-01-73': 'The Knight of Despair',
    'O-04-66': 'The Little Prince',
    'O-02-74': 'The Naked Nest',
    'O-01-04': 'The Queen of Hatred',
    'O-07-103': 'Yang',
    'O-05-102': 'Yin',
    'O-02-63': 'Apocalypse Bird',
    'O-03-93': 'Blue Star',
    'O-03-89': 'CENSORED',
    'D-03-109': 'Melting Love',
    'T-01-75': 'Mountain of Smiling Bodies',
    'O-06-20': 'Nothing There',
    'T-01-31': 'The Silent Orchestra',
    'T-03-46': 'WhiteNight',
  } as Record<string, string>,

  /**
   * Field notes by classification code, for logged abnormalities. Read as written.
   * Use a template string (backticks) and leave a blank line between paragraphs.
   */
  notes: {
    'O-03-03': `Pretty simple, first abnormality that teaches you the basics of what's to come.

It's notably easy to handle, deals moderate to low damage even in early game and provides the first accessible white weapons to recover other employees from panic + a matching resist E.G.O suit. It also doesn't breach containment so don't worry about the Qliphoth Counter with this one.

And it's also based of Jesus apparently.`,

    'F-05-52': `Lore is crazy with this one. Bottom line, a pretty nice and straightforward training abnormality that recovers HP and SP depending on which type of activity you choose to conduct. Instinct recovers HP, Insight recovers SP, and both Attachment and Repression recover a bit of each. It also doesn't breach containment and has no Qliphoth Counter.

There's one tiny factor that can potentially make it dangerous: if the experiment yields bad results, the employee involved will be sent on an involuntary fishing trip and be considered dead. No way to save them.

That's still quite manageable considering how favorable Instinct and Insight work are. Attachment and Repression are somewhat riskier, though, so I'd recommend sticking to the former two unless you're specifically trying to train other stats.`,

    'O-03-60': `This one's a bit tricky. You'll learn from the lore that the abnormality itself means no harm, but it's still an eldritch being from outer space capable of frying a human's brain.

It has this mechanic where mediocre or bad results have a 50% and 70% chance, respectively, of decreasing its Qliphoth Counter. Employees panicking during work will also lower it. You can minimize the chances of it breaking containment by consistently producing good results, preferably through Attachment work.

That said, if it breaches containment, it's pretty hard to deal with in the early game, so leave it alone if you can safely finish the day or retry if you must. If you have to suppress it, try long-ranged weapons, preferably ones that deal WHITE damage, and watch out for the singing attack that drains SP. Take your employees away if it starts.`,

    'O-02-56': `Pure bait. It looks cute and innocent, don't fall for it.

Basically, it can be safely examined via Insight work and yields some nice E.G.O equipment, including a ranged weapon (although relatively expensive in comparison to other early-game options).

Its Qliphoth Counter has a chance of decreasing whenever you start working on another abnormality, and employees panicking will also lower it. Expect it to breach containment somewhat frequently. No matter what you do, don't try to suppress it. That's practically guaranteed death in the early game.

Fortunately, the birb deals laughable damage when it's on the loose and usually goes back to containment on its own, so you just need to play the waiting game and not interact with it for a while.

Interestingly enough, it can actually help employees recover from panic by pecking some sense back into them. Apparently, the birb has some redeeming qualities after all.`,

    'T-09-09': `This is one of the very first tools you might encounter. Tools work a little differently than regular abnormalities. They don't yield E.G.O equipment and have different means of unlocking their information, such as time spent using them. Using them also doesn't progress the Qliphoth Meltdown Gauge, so they can be explored for relatively cheap.

Theresia in particular is useful, but with a catch. It will periodically recover SP for employees belonging to the entire department where it's contained, including the employee operating it if they belong to that department.

Between the 20th and 30th second of continuous use, however, the employee operating it will start losing SP rapidly and, if left unattended, will eventually PANIC.

Recommendation is to use it sparingly whenever you need to quickly replenish SP across a department, but beware because you'll need to micromanage the cancellation before the 20-second mark.

You'd be surprised at how much damage a single panicking employee can indirectly cause. Speaking from experience here.`,
  } as Record<string, string>,
}
