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
      {
        id: 'late_floor',
        label: 'Late on the floor',
        cost: 0,
        minStage: 3,
        scene: "Past midnight. A rough code. You find each other in the quiet end of the hallway afterward — both still holding it together the way people do when they have to.",
        dialogues: [
          {
            prompt: "She leans against the wall next to you. Quiet for a long moment. Then: 'I've been doing this long enough to know it doesn't get easier. You just get better at carrying it.'",
            options: [
              { text: "'You help. That's not a small thing.'", gain: 24 },
              { text: "'Yeah. I think that's right.' You mean it completely.", gain: 20 },
              { text: "'Some nights it feels like that's exactly the wrong thing to get good at.'", gain: 16 },
            ],
          },
          {
            prompt: "She looks over at you. 'I keep expecting it to feel normal — you. This.' A pause. 'It doesn't. I mean that in a good way.'",
            options: [
              { text: "'Same. Every time.' You don't dress it up.", gain: 26 },
              { text: "'You could have told me that six weeks ago.' You're smiling.", gain: 22 },
              { text: "Take her hand. Don't say anything.", gain: 24 },
            ],
          },
        ],
        fadeToBlack: null,
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'simone',
    name: 'Simone Okafor',
    age: 30,
    occupation: 'Palliative Care NP',
    bio: 'Navigates the hardest conversations in the hospital with quiet precision. Carries a lot without showing it. Warm, direct, and genuinely curious about people — she finds pharmacists deeply underrated.',
    portraitBg: '#2E1A42',
    portraitAccent: '#C0781E',
    /* swap point — replace placeholder with:
       <img src="/src/assets/portraits/simone.png" alt="Simone" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:12}} />
    */
    intro: "I spend my days helping people accept what can't be changed. You spend yours trying to change outcomes. I think we probably need each other.",
    shiftQuips: {
      good: [
        "A pharmacist who actually slows down with the patient. Rare. I've noticed.",
        "That was excellent. I've watched attendings be less present than you were just now.",
      ],
      bad: [
        "You look like you need someone to tell you you're doing okay. You are.",
        "Rough one? My office has decent coffee and zero judgment. Open offer.",
      ],
      neutral: [
        "Another afternoon keeping the system honest. Same as it ever was.",
      ],
    },
    dates: [
      {
        id: 'coffee',
        label: 'Coffee break',
        cost: 10,
        minStage: 0,
        scene: "The chaplaincy break room, between rounds. She's the only person in this building who doesn't seem to be running from something.",
        dialogues: [
          {
            prompt: "She pours coffee without asking how you take it. Gets it right. 'I work with people in crisis — you pick things up.'",
            options: [
              { text: "\"That's either a skill or a warning.\"", gain: 12 },
              { text: "\"You got it exactly right. I'm a little unsettled.\"", gain: 9 },
              { text: "\"How many pharmacists have you analyzed in a break room?\"", gain: 16 },
            ],
          },
          {
            prompt: "\"What brought you into pharmacy? The honest answer — not the application essay.\"",
            options: [
              { text: "\"Someone I loved got the wrong medication. I decided to be the person who catches that.\"", gain: 18 },
              { text: "\"I wanted to be useful without the diagnostic glamour. Chemistry made sense.\"", gain: 13 },
              { text: "\"The biochemistry genuinely fascinated me. Everything else followed.\"", gain: 9 },
            ],
          },
        ],
        fadeToBlack: null,
      },
      {
        id: 'terrace',
        label: 'Terrace garden',
        cost: 0,
        minStage: 1,
        scene: "The hospital's third-floor terrace. Nobody uses it in November. You both end up there anyway.",
        dialogues: [
          {
            prompt: "\"I talk to a lot of people about medication near the end of their lives,\" she says. \"I've never asked a pharmacist what it feels like from your side.\"",
            options: [
              { text: "\"It's the part of the job that doesn't leave you when you clock out.\"", gain: 18 },
              { text: "\"Every comfort-care consult lands differently. Some I think about for days.\"", gain: 16 },
              { text: "\"You're genuinely the first person who's ever asked.\"", gain: 13 },
            ],
          },
          {
            prompt: "She's quiet for a moment. Then: 'I chose this work because endings matter. Do you think about that?'",
            options: [
              { text: "\"Every time I flag a high-alert med. The whole job is the distance between harm and help.\"", gain: 20 },
              { text: "\"Constantly. It's why we check twice.\"", gain: 14 },
              { text: "\"I think about it. I don't talk about it much.\" A pause. \"Until now, maybe.\"", gain: 18 },
            ],
          },
        ],
        fadeToBlack: null,
      },
      {
        id: 'dinner',
        label: 'Dinner',
        cost: 45,
        minStage: 2,
        scene: "You both had a harder week than you've admitted to anyone. Dinner was her idea.",
        dialogues: [
          {
            prompt: "\"What's something you've gotten wrong that still sits with you?\"",
            options: [
              { text: "\"A patient I didn't slow down for. She was trying to tell me something. I had three people in line. I still don't know what she needed.\"", gain: 20 },
              { text: "\"I flagged an interaction and moved on without following up. The prescriber caught it. But I should have called.\"", gain: 16 },
              { text: "\"I keep a list. It's long. I read it sometimes to remember why pace matters.\"", gain: 14 },
            ],
          },
          {
            prompt: "She looks at you across the table. 'You're genuinely good at this. Does anyone ever actually tell you that?'",
            options: [
              { text: "\"Not often enough for it to feel normal. Thank you.\"", gain: 18 },
              { text: "\"You don't have to say that.\" She says: 'I know. I want to.'", gain: 22 },
              { text: "\"Ask me again after my next audit.\"", gain: 11 },
            ],
          },
        ],
        fadeToBlack: {
          minAffectionForScene: 120,
          text: "Neither of you orders dessert. The restaurant fills in around you and neither of you notices. The walk back takes twice as long as it needs to.",
          cut: "★ ★ ★",
          morning: "She's already back at the hospital. There's a text: 'The terrace is better in December, apparently. — S'",
        },
      },
      {
        id: 'saturday_market',
        label: 'Saturday market',
        cost: 20,
        minStage: 3,
        scene: "Off-duty. Both of you out of scrubs for the first time in recent memory. You run into each other at the farmers market and neither of you leaves.",
        dialogues: [
          {
            prompt: "She buys two things and then walks beside you with her hands in her coat pockets. 'I'm terrible at this,' she says. 'Days off. Turns out I don't know what I like outside of the hospital.'",
            options: [
              { text: "'I think you like this. You've been smiling for twenty minutes.'", gain: 24 },
              { text: "'Then we figure it out. We have time.'", gain: 22 },
              { text: "'That's the first thing you've said today that I don't believe.'", gain: 18 },
            ],
          },
          {
            prompt: "At a flower stall, she picks something up and puts it back. 'I spend my whole career telling people what matters. I'm not always sure I live that way.' A pause. 'I think you're changing that.'",
            options: [
              { text: "'You've been showing me the same thing. It goes both ways.'", gain: 26 },
              { text: "Pick up what she put down. Hand it to her without a word.", gain: 24 },
              { text: "'Don't give me credit for something you were already doing.'", gain: 20 },
            ],
          },
        ],
        fadeToBlack: null,
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
      {
        id: 'board_prep',
        label: 'Board exam prep',
        cost: 0,
        minStage: 3,
        scene: "She's deep in boards prep. You offered to quiz her. She accepted before you finished asking.",
        dialogues: [
          {
            prompt: "She's halfway through a practice question set, muttering pharmacokinetics under her breath. 'This is the most relaxed I've been in a week,' she says. You're not sure if she means the studying or the company.",
            options: [
              { text: "'Then let's get through renal dosing so you can actually relax.'", gain: 20 },
              { text: "'I'll take that as a compliment on my quizzing technique.'", gain: 18 },
              { text: "Cover the flashcard with your hand. 'Five minutes. You've earned it.'", gain: 24 },
            ],
          },
          {
            prompt: "Two hours in, she closes the book. 'I'm going to pass this because I had someone worth impressing.' She says it like a clinical observation. It's not.",
            options: [
              { text: "'You'd pass either way. But I'm glad I was here.'", gain: 26 },
              { text: "'That's the most romantic thing you've ever said to me.' She rolls her eyes. You're both right.", gain: 24 },
              { text: "'You never needed me for that. But I'll take the credit.'", gain: 20 },
            ],
          },
        ],
        fadeToBlack: null,
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'lin',
    name: 'Lin Nakamura',
    age: 27,
    occupation: 'Clinical Pharmacist / Drug Info',
    bio: "Precise, citation-ready, and the person who writes the pharmacy intranet guidelines that everyone ignores until there's a lawsuit. She warms up slowly and trusts people who catch what she would have caught.",
    portraitBg: '#1A2E4A',
    portraitAccent: '#7EB8C9',
    intro: "Your warfarin-fluconazole interaction catch last month got cited in the pharmacy newsletter. I wrote the newsletter. I noticed.",
    shiftQuips: {
      good: [
        "Accurate, efficient, safe. If only everyone else defaulted to that.",
        "You actually read the full monograph before you answered. I respect that.",
      ],
      bad: [
        "I've run fourteen DI consults today. Tell me the worst part of your day.",
        "Sit with me. I'll get the bad coffee. You talk first.",
      ],
      neutral: [
        "Another day cross-referencing what the prescribers should have caught. Standard Tuesday.",
      ],
    },
    dates: [
      {
        id: 'terminal',
        label: 'DI terminal',
        cost: 0,
        minStage: 0,
        scene: "The drug information terminal in the pharmacy library. You both ended up there after hours on the same consult.",
        dialogues: [
          {
            prompt: "She pulls up the same reference you were looking for. 'You were going to cite Lexicomp? I have the primary literature.'",
            options: [
              { text: "Apologetically clinical — acknowledge Lexicomp was a shortcut.", gain: 8 },
              { text: "Confident about your choice — it was fast and accurate.", gain: 12 },
              { text: "Ask to see hers. You're genuinely interested.", gain: 16 },
            ],
          },
          {
            prompt: "The consult resolves. She closes her laptop. 'What brought you into this part of pharmacy?' She's actually asking.",
            options: [
              { text: "Personal backstory about the job — the real answer.", gain: 18 },
              { text: "Clinical answer — drug information was the most rigorous track.", gain: 10 },
              { text: "Deflect with a question back — ask her the same thing.", gain: 13 },
            ],
          },
        ],
        fadeToBlack: null,
      },
      {
        id: 'after_rounds',
        label: 'After rounds',
        cost: 10,
        minStage: 1,
        scene: "The clinical pharmacist lounge, which is mostly just a table with good chairs. She saved you a seat.",
        dialogues: [
          {
            prompt: "She slides you a sticky note. A drug interaction you flagged last week, with two primary citations she found supporting your call. 'You were right. I looked it up.'",
            options: [
              { text: "Thank her warmly — this matters more than she knows.", gain: 16 },
              { text: "Make a clinical point about why the interaction mechanism matters.", gain: 10 },
              { text: "Say you knew and wanted her to confirm it anyway.", gain: 18 },
            ],
          },
          {
            prompt: "'I don't usually do this,' she says, meaning spending non-required time with a person at work. 'I know,' you say.",
            options: [
              { text: "Leave space. Let the moment hold.", gain: 18 },
              { text: "Ask what changed.", gain: 15 },
              { text: "Tell her you noticed a while ago.", gain: 20 },
            ],
          },
        ],
        fadeToBlack: null,
      },
      {
        id: 'dinner',
        label: 'Off-campus dinner',
        cost: 40,
        minStage: 2,
        scene: "First time either of you has been outside the hospital for something that isn't a conference. The restaurant doesn't know what a DUR is. It's fine.",
        dialogues: [
          {
            prompt: "'Tell me something true about yourself that's not on your CV.' She's half-smiling. This is her version of playful.",
            options: [
              { text: "Vulnerable personal answer — something she couldn't have predicted.", gain: 20 },
              { text: "Something clinical that reveals character — what you actually care about.", gain: 14 },
              { text: "Turn it back on her. Same question, same stakes.", gain: 16 },
            ],
          },
          {
            prompt: "She says: 'I think I've been using precision as a reason not to let people close. It's easier to verify facts than to trust people.'",
            options: [
              { text: "Tell her you see that and it's okay.", gain: 20 },
              { text: "Say you have the same problem.", gain: 18 },
              { text: "Just sit with it and let it breathe.", gain: 22 },
            ],
          },
        ],
        fadeToBlack: {
          minAffectionForScene: 120,
          text: "The restaurant clears out. You stay. She doesn't check her phone once. Neither do you.",
          cut: "★ ★ ★",
          morning: "A morning text: 'P450 3A4 inhibitors. You were right about all of them. — L'",
        },
      },
    ],
  },
];
