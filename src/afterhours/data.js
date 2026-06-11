/* ============================================================
   RxReady After Hours — Love interest data & dialogue trees
   All characters are 25+ years old. Romance is non-explicit.
   Fade-to-black with morning-after beat only.
   ============================================================ */

export const STAGE_LABELS = ['Acquaintance', 'Flirting', 'Dating', 'Committed'];
export const STAGE_COLORS = ['#6E7C70', '#C0781E', '#E2A552', '#2E8B57'];

/* Affection thresholds per stage: [0, 35, 90, 180] — defined in save.js */

export const LOVE_INTERESTS = [
  /* ------------------------------------------------------------------ */
  {
    id: 'jada',
    name: 'Jada Westbrook',
    age: 29,
    occupation: 'ER Nurse',
    bio: 'Sardonic, quick-witted, deeply competent, and has seen too much to be impressed by much. She trusts actions over words.',
    portraitBg: '#2C4A3E',
    portraitAccent: '#E2A552',
    /* swap point — replace placeholder with:
       <img src="/src/assets/portraits/jada.png" alt="Jada" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:12}} />
    */
    intro: "So you're the pharmacist who almost got me fired with that warfarin counsel last month. Good. You probably saved a patient too.",
    shiftQuips: {
      good: [
        "ER nurses and pharmacists — the last two lines of sanity in this whole building.",
        "See? Competent people. We do exist.",
      ],
      bad: [
        "Rough one? Come on, even bad shifts end. Buy me coffee and tell me about it.",
        "You look like I feel after a double. Get off your feet for five minutes.",
      ],
      neutral: [
        "Another day, another near-miss caught at the last second. Glamorous, isn't it.",
      ],
    },
    dates: [
      {
        id: 'coffee',
        label: 'Coffee break',
        cost: 15,
        minStage: 0,
        scene: "Hospital break room, between shifts. It's the first time you've talked without a patient between you.",
        dialogues: [
          {
            prompt: "She glances at your coffee. \"You actually take it black? No judgment — just diagnostic.\"",
            options: [
              { text: "\"I've had enough sugar from IV bags today. Long shift.\"", gain: 8 },
              { text: "\"Trying to project an image of competence. Is it working?\"", gain: 12 },
              { text: "\"Yeah. Keeps me honest.\"", gain: 5 },
            ],
          },
          {
            prompt: "She asks about your worst pharmacy mistake — really asks, not just making conversation.",
            options: [
              { text: "\"Once cleared a duplicate therapy assuming it was intentional. Still think about it.\"", gain: 16 },
              { text: "\"Patient data only. This coffee is technically on the clock.\"", gain: 4 },
              { text: "\"Why, want to feel better about your own list?\"", gain: 9 },
            ],
          },
        ],
        fadeToBlack: null,
      },
      {
        id: 'dinner',
        label: 'Dinner after shift',
        cost: 45,
        minStage: 1,
        scene: "A quiet spot that's definitely not the hospital cafeteria. You both still smell vaguely like the ER.",
        dialogues: [
          {
            prompt: "She orders the most expensive thing without checking the price. \"I spent eight hours keeping people alive today. I earned this.\"",
            options: [
              { text: "\"I ran a full Shift simulation before heading out. I think we both did.\"", gain: 12 },
              { text: "\"Then you're buying dessert.\"", gain: 16 },
              { text: "\"The most expensive thing is the tiramisu, just so you know.\"", gain: 7 },
            ],
          },
          {
            prompt: "\"Tell me something about pharmacy that most people completely get wrong.\"",
            options: [
              { text: "\"That we just count pills. Eighty percent of what we do is catching what nobody else did.\"", gain: 13 },
              { text: "\"That drug interactions are obvious. Half the dangerous ones look harmless on paper.\"", gain: 17 },
              { text: "\"That there's ever time to answer that question properly.\"", gain: 7 },
            ],
          },
        ],
        fadeToBlack: null,
      },
      {
        id: 'walk',
        label: 'Late-night walk',
        cost: 0,
        minStage: 2,
        scene: "Neither of you has anywhere to be. You end up walking the long way back from the parking garage.",
        dialogues: [
          {
            prompt: "She stops walking. Just stops. Looks up. \"Do you ever worry you're becoming the job?\"",
            options: [
              { text: "\"Constantly. That's why I'm out here instead of running another drill.\"", gain: 18 },
              { text: "\"Only when the job starts feeling like the best part of the day.\"", gain: 15 },
              { text: "\"No. I'm clearly out here talking to a person.\"", gain: 10 },
            ],
          },
          {
            prompt: "She's quiet for a moment. Then: \"I'm glad we started doing this.\"",
            options: [
              { text: "\"Same. You make the worst hours easier to get through.\"", gain: 20 },
              { text: "\"Me too.\" Leave it there. Let it breathe.", gain: 18 },
              { text: "\"Don't get sentimental on me, Westbrook.\"", gain: 12 },
            ],
          },
        ],
        fadeToBlack: {
          minAffectionForScene: 120,
          text: "The conversation slows. The street is quiet. You walk back slowly, neither of you making any move to end the night.",
          cut: "★ ★ ★",
          morning: "She leaves her coffee on your counter without waking you. There's a note: 'You're still bad at taking it black. — J'",
        },
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'marco',
    name: 'Marco Delgado',
    age: 32,
    occupation: 'Patient Advocate',
    bio: 'Former pharmaceutical rep who burned his bridges when he grew a conscience. Charming, irreverent, and surprisingly principled under the polish.',
    portraitBg: '#2A3F6A',
    portraitAccent: '#C0781E',
    /* swap point — replace placeholder with:
       <img src="/src/assets/portraits/marco.png" alt="Marco" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:12}} />
    */
    intro: "I used to sell you drugs. Now I'm trying to make sure people can actually afford them. Life takes weird turns. Buy me a drink?",
    shiftQuips: {
      good: [
        "Killing it out there. I always knew you were one of the good ones.",
        "That's the pharmacist I've heard about. The one people actually trust.",
      ],
      bad: [
        "Hey. Bad days happen to good people. Trust me — I've had the worst days.",
        "Take a breath. One bad shift doesn't define the next one.",
      ],
      neutral: [
        "Another shift, another story. Tell me the highlight reel later.",
      ],
    },
    dates: [
      {
        id: 'drinks',
        label: 'Drinks after work',
        cost: 20,
        minStage: 0,
        scene: "A bar that's one step above a dive. He's already there, already has your order figured out.",
        dialogues: [
          {
            prompt: "\"I have to ask,\" he says, swirling his drink. \"Do you hate me for the pharma rep thing?\"",
            options: [
              { text: "\"A little. You bought me lunch twice and I still didn't prescribe your statins.\"", gain: 13 },
              { text: "\"I've moved on. Apparently so have you.\"", gain: 8 },
              { text: "\"Tell me why you left first.\"", gain: 15 },
            ],
          },
          {
            prompt: "He tells you about the patient he watched get denied coverage for medication he'd been marking up for years. No self-pity. Just the facts.",
            options: [
              { text: "\"That's a hard thing to sit with. I'm glad it changed something.\"", gain: 18 },
              { text: "\"So you're still selling something — just with better branding now.\"", gain: 10 },
              { text: "\"What did you actually do about it?\"", gain: 14 },
            ],
          },
        ],
        fadeToBlack: null,
      },
      {
        id: 'dinner',
        label: 'Dinner',
        cost: 50,
        minStage: 1,
        scene: "A real restaurant. He dressed up. You're just off shift. Somehow it works.",
        dialogues: [
          {
            prompt: "\"I want to be clear about something,\" he says. \"I like you. Not 'let me pitch you something' like. Just — like.\"",
            options: [
              { text: "\"That's either very sincere or the best pitch you've ever run.\"", gain: 15 },
              { text: "\"I know. That's why I'm still here.\"", gain: 18 },
              { text: "\"Okay. Me too. Can we order now?\"", gain: 12 },
            ],
          },
          {
            prompt: "\"If everything changed tomorrow — different city, different job — what would you keep?\"",
            options: [
              { text: "\"The work. It actually matters. I'd rebuild everything else around it.\"", gain: 14 },
              { text: "\"Some people. You'd probably make the short list.\"", gain: 20 },
              { text: "\"My coffee maker and a good drug reference. Everything else is negotiable.\"", gain: 13 },
            ],
          },
        ],
        fadeToBlack: null,
      },
      {
        id: 'cooking',
        label: 'Cook dinner together',
        cost: 25,
        minStage: 2,
        scene: "His place. He actually knows how to cook, which is faintly annoying.",
        dialogues: [
          {
            prompt: "He hands you a knife and a cutting board. \"You chop. I'll do the rest. Don't overcomplicate it.\"",
            options: [
              { text: "\"I calculated a pediatric dose on a napkin while compounding. I can manage an onion.\"", gain: 13 },
              { text: "\"This feels like a test.\"", gain: 16 },
              { text: "\"Deal. You talk. I chop.\"", gain: 10 },
            ],
          },
          {
            prompt: "After dinner he says, quietly, \"I'm not in a rush with this. With us. Just so you know.\"",
            options: [
              { text: "\"Good. Neither am I.\"", gain: 18 },
              { text: "\"That's a very adult thing to say. I respect it.\"", gain: 16 },
              { text: "\"Is that your way of saying you want dessert first?\"", gain: 13 },
            ],
          },
        ],
        fadeToBlack: {
          minAffectionForScene: 120,
          text: "Dishes done. The evening winds down without hurry. No announcement — just the natural end of a night neither of you wanted to rush.",
          cut: "★ ★ ★",
          morning: "He's already up, coffee made, music on low. 'Figured you'd want something before the morning shift.' He hands you a mug. It's exactly right.",
        },
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'priya',
    name: 'Priya Mehta',
    age: 27,
    occupation: 'Internal Medicine Resident',
    bio: 'Running on spite, caffeine, and the terrifying certainty that she\'s always the smartest person in any room. She hides exhaustion with precision.',
    portraitBg: '#4A2A5A',
    portraitAccent: '#C0781E',
    /* swap point — replace placeholder with:
       <img src="/src/assets/portraits/priya.png" alt="Priya" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:12}} />
    */
    intro: "I'm running on 32 hours and the vending machine took my last dollar. If you have an actual clinical question for once in your life, I'm ready.",
    shiftQuips: {
      good: [
        "You make my job easier when you catch things before they reach me. Sincerely.",
        "Pharmacy caught another one today. This hospital might actually survive us.",
      ],
      bad: [
        "Rough day? I rotated through eleven patients before noon. We're tied. Tell me.",
        "You look terrible. In a relatable way.",
      ],
      neutral: [
        "Another day keeping the system from eating people alive. Heroic. Unrewarded. Usual.",
      ],
    },
    dates: [
      {
        id: 'coffee',
        label: 'Stolen 20 minutes',
        cost: 5,
        minStage: 0,
        scene: "You both have exactly 20 minutes before your next obligations. You use them.",
        dialogues: [
          {
            prompt: "\"Okay. Quick version: what's the most interesting interaction you've caught in the last month?\"",
            options: [
              { text: "\"Linezolid on an SSRI. Caught it before the chart came down. The resident was grateful and annoyed equally.\"", gain: 16 },
              { text: "\"Simvastatin and clarithromycin. Classic, but it still comes through.\"", gain: 10 },
              { text: "\"Why does this feel like a job interview?\"", gain: 12 },
            ],
          },
          {
            prompt: "She smiles for the first time. It's sudden. \"You actually like this. The clinical stuff. I wasn't sure.\"",
            options: [
              { text: "\"It's the reason I didn't go into anything else.\"", gain: 15 },
              { text: "\"Don't sound so surprised. I passed the same boards you're headed for.\"", gain: 13 },
              { text: "\"You thought pharmacists just counted pills, didn't you.\"", gain: 18 },
            ],
          },
        ],
        fadeToBlack: null,
      },
      {
        id: 'library',
        label: 'Late-night study break',
        cost: 10,
        minStage: 1,
        scene: "Medical library, after it closes. You both ended up here by accident.",
        dialogues: [
          {
            prompt: "She's annotating a journal article so aggressively you're not sure the paper will survive. \"Do you ever read for fun?\"",
            options: [
              { text: "\"I read Lexicomp updates for fun. I have a problem.\"", gain: 15 },
              { text: "\"Fiction. Only the kind with terrible endings. Good for managing expectations.\"", gain: 18 },
              { text: "\"Sometimes. This is more interesting right now.\"", gain: 10 },
            ],
          },
          {
            prompt: "She looks up. \"I want to say something without it being weird.\" Then doesn't say it.",
            options: [
              { text: "Wait. Give her the silence to fill.", gain: 18 },
              { text: "\"It's already a little weird. Just say it.\"", gain: 15 },
              { text: "\"Too late. It's already weird.\"", gain: 12 },
            ],
          },
        ],
        fadeToBlack: null,
      },
      {
        id: 'dinner',
        label: 'Actual dinner (rare)',
        cost: 40,
        minStage: 2,
        scene: "She had one evening off. You made the most of it.",
        dialogues: [
          {
            prompt: "\"Tell me something you've never said at work.\"",
            options: [
              { text: "\"Some days the whole system feels held together with fax machines and goodwill. And I love it anyway.\"", gain: 16 },
              { text: "\"I'm scared of the days I stop caring. I watch for it.\"", gain: 20 },
              { text: "\"That I'm running on spite and caffeine and it's working fine.\"", gain: 14 },
            ],
          },
          {
            prompt: "\"I think you're one of the few people who actually sees me. Not just the resident.\"",
            options: [
              { text: "\"Yeah. I do.\"", gain: 20 },
              { text: "\"You don't make it easy. But you're worth the effort.\"", gain: 22 },
              { text: "\"That might be the most honest thing you've said to me.\"", gain: 15 },
            ],
          },
        ],
        fadeToBlack: {
          minAffectionForScene: 120,
          text: "The restaurant closes around you. Neither of you noticed. Walking out, she takes your hand — briefly, like she's testing whether she's allowed. She is.",
          cut: "★ ★ ★",
          morning: "She's already gone when you wake up — on call at 5am. Your phone has a message: 'methotrexate + NSAIDs. Go.' You smile and answer it.",
        },
      },
    ],
  },
];
