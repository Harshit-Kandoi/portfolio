import { Note } from '../services/supabase';

export const NOTES_SEED: Note[] = [
  // ─── 💰 MONEY & LIFE ─────────────────────────────────────────────────────────
  {
    id: 'money-1',
    title: "Money Isn't My Goal",
    category: 'Money & Life',
    thought_type: 'Observation',
    status: 'evolving',
    last_updated: 'July 2026',
    date: '2026-07-20',
    read_time_mins: 3,
    tags: ['Money & Life', 'Mindset', 'Family'],
    is_featured: true,
    observation: "Growing up, I never worried much about money. But after college, watching my family go through dad's brain cancer treatment, loan pressures, and market slowdowns completely changed how I see money.",
    takeaways: [
      'I earn ₹29,000 a month right now, and some days it feels like trying to solve a puzzle with missing pieces.',
      'I struggle between saving every rupee because of financial insecurity vs wanting to actually live my life at 22.',
      "I don't think I'll feel rich because of a high salary; I'll feel rich when my parents' worries disappear."
    ],
    content: `### Where I am today
Some days I compare myself to friends who had bikes or sponsored my share when we went out. It leaves a quiet weight, but it also drives me to learn and build relentless persistence.

### Lessons from my father
I watched my father refuse to touch investments even during our toughest times, choosing to work harder instead. I don't know if I could have done that, but I want to become the kind of person who has that resilience.

### Reframing capability
I used to tell myself *"I'm not capable of managing everything."* But what I really meant was *"I don't trust my financial judgment yet."* Those are two very different things.`,
    still_thinking: "Maybe money isn't freedom. Maybe it's the ability to remove fear from the people you love. I'm not sure yet.",
    related_note_ids: ['money-3', 'growth-1', 'prod-1']
  },
  {
    id: 'money-2',
    title: "Why I Don't Feel Guilty Spending on Experiences",
    category: 'Money & Life',
    thought_type: 'Principle',
    status: 'stable',
    last_updated: 'July 2026',
    date: '2026-07-12',
    read_time_mins: 2,
    tags: ['Money & Life', 'Experiences', 'Mindset'],
    is_featured: false,
    observation: "I used to feel guilty spending ₹500 on dinner with friends or a late-night cab after an intense build session, treating every expense as money lost.",
    takeaways: [
      'Things lose value immediately after purchase; shared memories compound over time.',
      'Frugality is great for avoiding waste, but restrictive paranoia robs you of youth.',
      'Invest in moments that refresh your mind—they return 10x in energy and creative focus.'
    ],
    content: `### Memory Capital
I read a line once: *"You die with your memories, not your bank balance."* 

When money was tight, every rupee spent on leisure felt like a betrayal of my future. But looking back at the last three years, the only things I remember vividly aren't the ₹2,000 I saved in a bank account—it's the spontaneous midnight chai runs, working on projects with friends until sunrise, and traveling to new cities.

### The rule I live by
I will cut back aggressively on impulse gadget upgrades or clothes I don't need, but I will never hesitate to pay for dinner with people I care about or tools that make me 2x faster.`,
    still_thinking: "Where is the line between healthy investment in experiences and emotional spending to escape stress?",
    related_note_ids: ['money-1', 'rel-3', 'prod-3']
  },
  {
    id: 'money-3',
    title: 'The Promise I Made to My Parents',
    category: 'Money & Life',
    thought_type: 'Lesson',
    status: 'evolving',
    last_updated: 'June 2026',
    date: '2026-06-25',
    read_time_mins: 3,
    tags: ['Money & Life', 'Family', 'Drive'],
    is_featured: true,
    observation: "Watching my parents quietly calculate monthly budgets and forgo things they loved made a permanent mark on me. My core drive comes from wanting to give them complete peace of mind.",
    takeaways: [
      "My ambition isn't about buying sports cars; it's about paying off every family debt.",
      'Parents rarely ask for help, but they carry heavy invisible loads.',
      'Building leverage early in life is the best gift you can give your future family.'
    ],
    content: `### The quiet sacrifices
When you grow up seeing your parents prioritize your education over their own comfort, you realize that your success isn't just yours—it's a shared investment.

### Turning pressure into fuel
Some people call this "family pressure" and consider it a burden. I choose to view it as a privilege. Having a deeply personal reason to succeed keeps you focused when motivation wanes at 2 AM.`,
    still_thinking: "How do I balance taking care of my family with building a path that is uniquely my own?",
    related_note_ids: ['money-1', 'growth-3', 'psych-2']
  },

  // ─── 🌱 GROWTH ───────────────────────────────────────────────────────────────
  {
    id: 'growth-1',
    title: 'The Comparison Trap & Building My Own Footing',
    category: 'Growth',
    thought_type: 'Question',
    status: 'evolving',
    last_updated: 'May 2026',
    date: '2026-05-25',
    read_time_mins: 3,
    tags: ['Growth', 'Mindset', 'Self-Reliance'],
    is_featured: true,
    observation: "The world isn't fair and doesn't give everyone an equal starting line. Accepting that without becoming bitter is the hardest mental transition.",
    takeaways: [
      'Comparison is exhausting when everyone starts from different places.',
      'Channeling insecurity into building valuable skills is the only way forward.',
      'Grateful for the struggle because it forces me to develop true independence.'
    ],
    content: `### Starting lines are different
Some people start with family backups, capital, and networks. Others start with family responsibilities, loans, and zero safety nets.

Complaining about the starting line changes nothing. Building skills and compounding small daily wins changes everything.`,
    still_thinking: 'Will the chip on my shoulder disappear once I achieve security, or will I just find a new reason to feel behind?',
    related_note_ids: ['money-1', 'growth-3', 'psych-3']
  },
  {
    id: 'growth-2',
    title: "Why I Want to Build a Business Before I'm 30",
    category: 'Growth',
    thought_type: 'Framework',
    status: 'evolving',
    last_updated: 'July 2026',
    date: '2026-07-02',
    read_time_mins: 3,
    tags: ['Growth', 'Entrepreneurship', 'Independence'],
    is_featured: false,
    observation: "Working for a paycheck teaches discipline, but building an independent engine teaches ownership, survival, and real-world value creation.",
    takeaways: [
      "Salaries buy comfort; equity and products buy freedom.",
      'Failure in your 20s is cheap experience; failure later carries higher stakes.',
      'Learning to sell, market, and design is as important as writing clean code.'
    ],
    content: `### The itch for ownership
I love engineering, but code inside a corporate vacuum can feel detached from real human outcomes. Building a product from zero forces you to confront product-market fit, user psychology, and financial sustainability.

### The timeline
I set 30 as a target not because of an arbitrary number, but because your 20s are meant for taking asymmetrical upside risks while your energy and agility are at their peak.`,
    still_thinking: "Should I build niche micro-SaaS tools first, or focus on a single high-impact problem?",
    related_note_ids: ['growth-3', 'career-2', 'learning-2']
  },
  {
    id: 'growth-3',
    title: 'The Difference Between Ambition and Pressure',
    category: 'Growth',
    thought_type: 'Observation',
    status: 'stable',
    last_updated: 'June 2026',
    date: '2026-06-18',
    read_time_mins: 2,
    tags: ['Growth', 'Mental Health', 'Mindset'],
    is_featured: false,
    observation: "Ambition pulls you toward a vision with excitement. Pressure pushes you from behind with fear. Confusing the two leads straight to anxiety.",
    takeaways: [
      'Ambition comes from internal curiosity; pressure comes from external expectations.',
      'When you act out of fear of falling behind, even victories feel empty.',
      'Filter out noise: most people are giving advice based on their own fears, not your context.'
    ],
    content: `### Disentangling the motive
For years I thought my constant restlessness was pure ambition. But when I dissected it, half of it was fear—fear of not being recognized, fear of staying stagnant, fear of underperforming.

Real ambition feels light and play-like. Pressure feels heavy and performative.`,
    still_thinking: "How do I keep my standards high without letting fear creep back into the driver's seat?",
    related_note_ids: ['growth-1', 'prod-1', 'psych-3']
  },

  // ─── 🎯 CAREER ───────────────────────────────────────────────────────────────
  {
    id: 'career-1',
    title: 'Opinions Most Engineers Disagree With',
    category: 'Career',
    thought_type: 'Principle',
    status: 'evolving',
    last_updated: 'July 2026',
    date: '2026-07-15',
    read_time_mins: 2,
    tags: ['Career', 'Engineering', 'Product'],
    is_featured: true,
    observation: 'Most engineers obsess over complex architectures, newest frameworks, and code perfectionism. I care about whether a real human actually finds joy or help in what I built.',
    takeaways: [
      'Empathy and user experience matter 10x more than showing off complex code.',
      'Shipping a 70% functional tool today beats an over-engineered app that never launches.',
      'A sleek UI with smooth details builds trust faster than a 100-page spec doc.'
    ],
    content: `### Code is a means, not the end
I've seen projects with pristine test coverage and microservice architectures die with 0 users. And I've seen simple, monolithic apps solve massive real-world problems.

### Building in public
I'd rather build an OS portfolio with minor flaws that people smile while using than write a flawless backend microservice that nobody ever sees.`,
    still_thinking: 'Am I oversimplifying? Maybe. But every project I\'ve shipped succeeded because of empathy and clarity, not complexity.',
    related_note_ids: ['career-2', 'career-3', 'ai-2']
  },
  {
    id: 'career-2',
    title: 'Why I Care More About UX Than Algorithms',
    category: 'Career',
    thought_type: 'Observation',
    status: 'stable',
    last_updated: 'June 2026',
    date: '2026-06-30',
    read_time_mins: 3,
    tags: ['Career', 'UX', 'Design', 'Engineering'],
    is_featured: false,
    observation: "An algorithm saved 10ms of backend computation, but a confusing button layout wasted 10 seconds of human time. Good UX is the ultimate respect for the user.",
    takeaways: [
      'Code runs on servers, but interfaces run in human minds.',
      'Great UI reduces cognitive load and makes users feel capable and smart.',
      "Micro-animations, typography, and contrast aren't visual fluff—they are communication."
    ],
    content: `### The invisible bridge
When someone opens an app, they don't care if it's powered by Rust, Go, or Node.js. They care if it responds instantly, feels natural, and solves their problem cleanly.

Design isn't just how it looks; it's how it feels when your cursor moves across the screen.`,
    still_thinking: "Why do so many computer science curricula ignore interface design and human psychology entirely?",
    related_note_ids: ['career-1', 'ai-2', 'learning-2']
  },
  {
    id: 'career-3',
    title: 'My Definition of a Great Engineer',
    category: 'Career',
    thought_type: 'Framework',
    status: 'stable',
    last_updated: 'May 2026',
    date: '2026-05-14',
    read_time_mins: 2,
    tags: ['Career', 'Engineering', 'Craft'],
    is_featured: false,
    observation: "A junior engineer thinks their job is writing code. A senior engineer knows their job is solving problems with the least code possible.",
    takeaways: [
      'Clarity of thought precedes clarity of code.',
      'The best feature is often the one you decided NOT to build.',
      'Communication, accountability, and reliability outweigh technical wizardry.'
    ],
    content: `### The three pillars
1. **Pragmatism**: Choose tools based on problem constraints, not tech twitter hypes.
2. **Empathy**: Write code that the developer after you can understand in 5 minutes.
3. **Execution**: Ship consistently and take pride in polished end-to-end delivery.`,
    still_thinking: "How do I maintain my velocity while continuing to deepen technical mastery?",
    related_note_ids: ['career-1', 'psych-1', 'learning-3']
  },

  // ─── 🤖 AI ──────────────────────────────────────────────────────────────────
  {
    id: 'ai-1',
    title: 'What Excites Me and What Scares Me About AI',
    category: 'AI',
    thought_type: 'Thought',
    status: 'evolving',
    last_updated: 'May 2026',
    date: '2026-05-18',
    read_time_mins: 2,
    tags: ['AI', 'Technology', 'Future'],
    is_featured: false,
    observation: 'AI allows a single curious engineer to build applications that used to take a whole team. But if we let AI write our thoughts for us, we lose our soul.',
    takeaways: [
      'Use AI as an accelerator for code execution, never as a substitute for human feeling.',
      "Tools like AI can't generate personal taste, empathy, or lived experience.",
      'The most memorable software will always be the ones that feel distinctly human.'
    ],
    content: `### The double-edged sword
- **What excites me**: I can prototype ideas, explore new stacks, and build complex applications 10x faster.
- **What scares me**: A web filled with generic, sterile content where nobody expresses vulnerability or real human flaws.`,
    still_thinking: 'Technology should serve human connection, not synthesize it.',
    related_note_ids: ['ai-2', 'ai-3', 'career-1']
  },
  {
    id: 'ai-2',
    title: 'AI Won\'t Replace Taste',
    category: 'AI',
    thought_type: 'Principle',
    status: 'stable',
    last_updated: 'July 2026',
    date: '2026-07-08',
    read_time_mins: 3,
    tags: ['AI', 'Design', 'Taste', 'Humanity'],
    is_featured: true,
    observation: "AI can generate 1,000 layouts in 10 seconds. But deciding WHICH layout feels right, elegant, and resonant requires human taste.",
    takeaways: [
      'Commoditization of synthesis raises the premium on curation and judgment.',
      'Taste is built through years of reading, building, failing, and observing human delight.',
      'Prompting is trivial; knowing what is worthy of being created is hard.'
    ],
    content: `### The Curation Era
When anyone can write a prompt and generate code, code ceases to be the bottleneck. The bottleneck becomes **Taste**—knowing what to keep, what to delete, and what details matter.

### What is Taste?
Taste is opinionated simplicity. It's knowing when a UI feels cluttered, when a sentence feels dishonest, or when a product is missing warmth.`,
    still_thinking: "Can taste be taught systematically, or is it purely absorbed through exposure to great art and craftsmanship?",
    related_note_ids: ['ai-1', 'career-2', 'psych-1']
  },
  {
    id: 'ai-3',
    title: 'The Future I Hope AI Creates',
    category: 'AI',
    thought_type: 'Question',
    status: 'evolving',
    last_updated: 'June 2026',
    date: '2026-06-12',
    read_time_mins: 2,
    tags: ['AI', 'Ethics', 'Future'],
    is_featured: false,
    observation: "I hope AI doesn't just turn humans into hyper-productive content machines, but rather frees us to create deeper art, solve hard diseases, and spend time with loved ones.",
    takeaways: [
      'Automation should buy us presence, not just more work hours.',
      'Sovereignty over our tools is vital—we must understand the systems we depend on.',
      'Democratized technology enables solo builders across the globe to compete on merit.'
    ],
    content: `### A builder's optimistic lens
Instead of replacing human agency, AI tools can act as an infinite co-founder—handling boilerplate, searching documentation instantly, and testing edge cases so we can focus on creative direction.`,
    still_thinking: "How do we ensure access to these powerful capabilities remains open to independent creators everywhere?",
    related_note_ids: ['ai-1', 'ai-2', 'growth-2']
  },

  // ─── 📖 LEARNING ─────────────────────────────────────────────────────────────
  {
    id: 'learning-1',
    title: 'How I Actually Learn Hard Things',
    category: 'Learning',
    thought_type: 'Framework',
    status: 'stable',
    last_updated: 'June 2026',
    date: '2026-06-28',
    read_time_mins: 2,
    tags: ['Learning', 'Systems', 'Execution'],
    is_featured: true,
    observation: "I don't learn by reading textbooks or watching 10-hour courses. I learn by breaking things, getting stuck at 1 AM, and building something real until it works.",
    takeaways: [
      'Start with a problem or idea I actually care about building.',
      'Skip theory until I hit a wall and desperately need it to move forward.',
      'Document what I learned or explain it to a friend so it stays in my head.'
    ],
    content: `### My chaotic learning loop
1. **Pick a goal**: *"Build a simulated Desktop OS in React."*
2. **Break it instantly**: Try building windowing, state management, and z-index handling from scratch.
3. **Suffer through docs**: Search only for the exact obstacle blocking me.
4. **Refactor**: Rebuild once I understand the pattern.`,
    still_thinking: "It's messy and sometimes frustrating, but it's the only way knowledge becomes permanent for me.",
    related_note_ids: ['learning-2', 'learning-3', 'career-3']
  },
  {
    id: 'learning-2',
    title: 'Why I Build Before I Learn',
    category: 'Learning',
    thought_type: 'Principle',
    status: 'stable',
    last_updated: 'July 2026',
    date: '2026-07-05',
    read_time_mins: 2,
    tags: ['Learning', 'Action', 'Prototyping'],
    is_featured: false,
    observation: "Tutorial purgatory is cozy because you never fail. Building immediately forces real feedback and creates friction, which is where real memory forms.",
    takeaways: [
      'Passive watching creates false competence; building creates true muscle memory.',
      'Inspiration follows action, not the other way around.',
      'A broken prototype teaches you more than a pristine tutorial repo.'
    ],
    content: `### The Just-In-Time Method
Learning ahead of time ("just in case") leads to forgotten concepts. Learning at the moment of friction ("just in time") leads to immediate application and retention.`,
    still_thinking: "When is foundational theory indispensable before diving into implementation?",
    related_note_ids: ['learning-1', 'career-1', 'growth-2']
  },
  {
    id: 'learning-3',
    title: 'Curiosity Is My Biggest Competitive Advantage',
    category: 'Learning',
    thought_type: 'Observation',
    status: 'evolving',
    last_updated: 'June 2026',
    date: '2026-06-04',
    read_time_mins: 2,
    tags: ['Learning', 'Mindset', 'Curiosity'],
    is_featured: false,
    observation: "When you are genuinely curious about how things work—whether it's z-index stacking, browser rendering, or human motivation—work feels like play.",
    takeaways: [
      'Curiosity renders discipline almost effortless.',
      'Follow your weird side-curiosities; they synthesize into unique skills.',
      'Never lose the habit of asking *"Why did they build it this way?"*'
    ],
    content: `### Playing the long game
Compounding intelligence isn't about grinding 16 hours a day; it's about following an endless thread of curiosity year after year until you've connected dots others missed.`,
    still_thinking: "How do I protect my curiosity from being diluted by daily admin tasks and deadline noise?",
    related_note_ids: ['learning-1', 'psych-1', 'career-3']
  },

  // ─── ❤️ RELATIONSHIPS ────────────────────────────────────────────────────────
  {
    id: 'rel-1',
    title: 'Radical Candor & Unspoken Resentment',
    category: 'Relationships',
    thought_type: 'Experiment',
    status: 'experiment',
    last_updated: 'May 2026',
    date: '2026-05-05',
    read_time_mins: 2,
    tags: ['Relationships', 'Communication', 'Vulnerability'],
    is_featured: false,
    observation: 'I used to hold back feedback or avoid uncomfortable conversations to keep the peace. But unspoken expectations always turn into quiet resentment.',
    takeaways: [
      'Direct, honest feedback delivered with care is respect, not hostility.',
      'Assume positive intent before reacting emotionally.',
      'Listen to understand the person, not to win an argument.'
    ],
    content: `### Being direct without being harsh
It's easy to be passive-aggressive or silent. It takes real courage to sit down with someone you care about and say: *"Hey, this felt off to me. Can we talk about it?"*`,
    still_thinking: 'It takes constant practice to be completely honest without being defensive. Still calibrating.',
    related_note_ids: ['rel-2', 'rel-3', 'psych-1']
  },
  {
    id: 'rel-2',
    title: 'Why Listening Is Harder Than Talking',
    category: 'Relationships',
    thought_type: 'Observation',
    status: 'stable',
    last_updated: 'June 2026',
    date: '2026-06-22',
    read_time_mins: 2,
    tags: ['Relationships', 'Empathy', 'Communication'],
    is_featured: false,
    observation: "Most people don't listen to understand; they listen to reply. Quieting your internal monologue while someone speaks is a rare gift.",
    takeaways: [
      'True presence means giving someone your full, unhurried attention.',
      "Don't jump straight into problem-solving when someone just wants to be heard.",
      'Validation precedes advice.'
    ],
    content: `### The impulse to fix
As an engineer, my immediate reaction to hearing a problem is to debug it. But human emotions aren't software bugs—they require empathy first, solutions second.`,
    still_thinking: "How do I catch myself when I start formulating answers in my head mid-conversation?",
    related_note_ids: ['rel-1', 'rel-3', 'psych-2']
  },
  {
    id: 'rel-3',
    title: 'People Remember How You Made Them Feel',
    category: 'Relationships',
    thought_type: 'Lesson',
    status: 'stable',
    last_updated: 'July 2026',
    date: '2026-07-16',
    read_time_mins: 2,
    tags: ['Relationships', 'Human Connection', 'Empathy'],
    is_featured: true,
    observation: "Years from now, nobody will remember the exact code you wrote or the slides you presented. They will remember if you made them feel valued, supported, and seen.",
    takeaways: [
      'Kindness is not weakness; it takes strength to remain warm in a cynical world.',
      'Celebrate others sincerely when they succeed.',
      'Small thoughtful gestures create bonds that last a lifetime.'
    ],
    content: `### Maya Angelou's wisdom
*"I've learned that people will forget what you said, people will forget what you did, but people will never forget how you made them feel."*

This quote guides how I want to build relationships—in work, in team collaborations, and in life.`,
    still_thinking: "Am I giving enough warmth and credit to the people around me every day?",
    related_note_ids: ['rel-1', 'rel-2', 'money-2']
  },

  // ─── 🧠 PSYCHOLOGY ───────────────────────────────────────────────────────────
  {
    id: 'psych-1',
    title: 'Why I Stopped Trying to Look Smart',
    category: 'Psychology',
    thought_type: 'Lesson',
    status: 'stable',
    last_updated: 'June 2026',
    date: '2026-06-10',
    read_time_mins: 2,
    tags: ['Psychology', 'Ego', 'Growth'],
    is_featured: false,
    observation: 'For a long time, I was terrified of admitting I didn\'t know something. Saying "I don\'t know" out loud freed up massive amounts of mental energy.',
    takeaways: [
      'Pretending to know things stops you from asking the exact questions that teach you.',
      'People respect raw honesty far more than rehearsed perfection.',
      'Curiosity beats ego every single time.'
    ],
    content: `### The freedom of "I don't know"
When I started asking dumb questions in public and admitting where I lacked knowledge, two things happened:
1. Experienced people actually wanted to help me.
2. The pressure to maintain a fake persona vanished.`,
    still_thinking: 'I still feel the urge to sound confident when I\'m uncertain. Catching myself in the act is the real work.',
    related_note_ids: ['psych-2', 'psych-3', 'learning-3']
  },
  {
    id: 'psych-2',
    title: 'Confidence vs Competence',
    category: 'Psychology',
    thought_type: 'Framework',
    status: 'evolving',
    last_updated: 'July 2026',
    date: '2026-07-01',
    read_time_mins: 3,
    tags: ['Psychology', 'Self-Awareness', 'Mindset'],
    is_featured: false,
    observation: "Competence is what you can actually execute when quiet. Confidence is your belief in your capacity to handle the unknown. You need both, but competence comes first.",
    takeaways: [
      'Fake confidence collapses under pressure; quiet competence endures.',
      "Real confidence is saying \"I don't know the solution yet, but I will figure it out.\"",
      'Build evidence of capability through small, finished projects.'
    ],
    content: `### Building quiet confidence
The only way to build authentic self-confidence is by keeping promises to yourself. Finishing a project, fixing a tough bug, or showing up when you promised creates an unshakeable inner bedrock.`,
    still_thinking: "How do you project confidence when entering an unfamiliar domain without over-promising?",
    related_note_ids: ['psych-1', 'psych-3', 'growth-1']
  },
  {
    id: 'psych-3',
    title: 'Why People Compare Themselves',
    category: 'Psychology',
    thought_type: 'Observation',
    status: 'stable',
    last_updated: 'June 2026',
    date: '2026-06-15',
    read_time_mins: 2,
    tags: ['Psychology', 'Human Behavior', 'Social Proof'],
    is_featured: false,
    observation: "Social media shows everyone's highlight reel while you experience your unedited behind-the-scenes. Comparing your internal mess to external polished persona is a recipe for misery.",
    takeaways: [
      'Measure yourself against who you were yesterday, not someone else today.',
      'Every person carries invisible struggles you know nothing about.',
      'Mute inputs that trigger envy; double down on inputs that inspire action.'
    ],
    content: `### The internal metric
The only competition worth playing is against your own past potential. If I am writing better code, thinking clearer, and acting kinder than I did six months ago, I am winning.`,
    still_thinking: "Why is social comparison so deeply wired into human nature?",
    related_note_ids: ['psych-1', 'growth-1', 'growth-3']
  },

  // ─── ⚡ PRODUCTIVITY ─────────────────────────────────────────────────────────
  {
    id: 'prod-1',
    title: 'What I Sacrifice Too Much',
    category: 'Productivity',
    thought_type: 'Mistake',
    status: 'experiment',
    last_updated: 'June 2026',
    date: '2026-06-20',
    read_time_mins: 2,
    tags: ['Productivity', 'Balance', 'Self-Care'],
    is_featured: false,
    observation: "I tend to trade sleep, rest, and peace of mind for progress. I feel an irrational guilt when I'm not building, learning, or working toward a goal.",
    takeaways: [
      "Rest isn't wasted time; burnout costs far more than a missed day of coding.",
      'I compare my current stage to people who had a 5-year head start.',
      'I need to treat rest as a scheduled necessity, not an earned luxury.'
    ],
    content: `### The constant itch
Even when I'm watching a movie or hanging out, a small voice in my head says: *"You could be building your portfolio, learning AI, or fixing a bug right now."*

That voice got me where I am, but if I don't manage it, it will burn me out.`,
    still_thinking: "I tell myself I'll slow down once I reach the next milestone. But the milestone keeps moving. I need to fix that.",
    related_note_ids: ['prod-2', 'prod-3', 'money-1']
  },
  {
    id: 'prod-2',
    title: "I Don't Believe in Hustle Culture",
    category: 'Productivity',
    thought_type: 'Principle',
    status: 'stable',
    last_updated: 'July 2026',
    date: '2026-07-10',
    read_time_mins: 2,
    tags: ['Productivity', 'Sustainability', 'Mindset'],
    is_featured: true,
    observation: "Hustle culture glorifies exhaustion as a badge of honor. Working 16 hours a day out of panic is inefficient compared to 4 hours of deep, focused leverage.",
    takeaways: [
      'Intensity attracts attention, but consistency builds empires.',
      'Work hard when engaged; disconnect completely when resting.',
      'Optimizing for long-term stamina beats short-term performative sprint.'
    ],
    content: `### Deep Work over Busy Work
True productivity isn't filling every minute with tasks. It's spending uninterrupted blocks of time solving high-leverage problems, then stepping away to let your brain synthesize ideas.`,
    still_thinking: "How do I maintain quiet focus in an ecosystem constantly pushing for loud hustle?",
    related_note_ids: ['prod-1', 'prod-3', 'growth-3']
  },
  {
    id: 'prod-3',
    title: 'Rest Is a Skill',
    category: 'Productivity',
    thought_type: 'Framework',
    status: 'evolving',
    last_updated: 'July 2026',
    date: '2026-07-18',
    read_time_mins: 2,
    tags: ['Productivity', 'Rest', 'Performance'],
    is_featured: false,
    observation: "Most people don't know how to rest—they just scroll on their phones while feeling guilty about not working. Genuine recovery is an active skill.",
    takeaways: [
      'Active rest (walks, gym, reading, conversations) restores energy.',
      'Passive distraction ( doom-scrolling, brainless browsing) drains mental energy further.',
      'Great ideas happen when your brain is relaxed, not when it is hyper-stimulated.'
    ],
    content: `### Learning to disengage
I've noticed my best architecture breakthroughs and UI ideas occur while walking without headphones or in the shower—when the mind has space to wander.

Protecting open, unstructured space in your calendar is essential for high-level thinking.`,
    still_thinking: "What daily evening ritual best signals to my brain that work is officially over?",
    related_note_ids: ['prod-1', 'prod-2', 'money-2']
  }
];
