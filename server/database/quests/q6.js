/** Quest 6 — Cognitive Biases in Economics */
module.exports = {
  key: 'q6',
  title: 'Cognitive Biases in Economics',
  description: 'Behavioral pitfalls: anchoring, loss aversion, sunk costs, herding, confirmation.',
  category: 'BEHAVIORAL_ECONOMICS',
  difficulty: 'BEGINNER',
  order_index: 6,
  xp_reward: 100,
  coin_reward: 25,
  icon_emoji: '🧠',
  prerequisite_key: null,
  lessons: [
    {
      title: 'Introduction to Behavioral Economics',
      content:
        'People aren’t perfectly rational “econs.” **Behavioral economics** blends psychology with choice.\n\n**System 1** is fast and emotional; **System 2** is slow and analytical—but we often lean on System 1 for money decisions.',
      key_terms: [
        { term: 'Behavioral Economics', definition: 'Psychology meets economic decision-making' },
        { term: 'Cognitive Bias', definition: 'Systematic thinking error' },
        { term: 'Rational Actor', definition: 'Traditional model of perfectly logical agents' },
        { term: 'System 1', definition: 'Fast, intuitive thinking' },
        { term: 'System 2', definition: 'Deliberate, effortful thinking' },
      ],
      fun_fact: 'Kahneman won the Nobel prize for this research.',
      real_world_example: 'Checkout-line treats exploit quick, automatic choices.',
    },
    {
      title: 'Anchoring & Loss Aversion',
      content:
        '**Anchoring** overweight first numbers (e.g., “was $200”). **Loss aversion**: losses hurt ~2× gains.\n\nTrials and “limited time” offers weaponize these forces.',
      key_terms: [
        { term: 'Anchoring', definition: 'Over-relying on an initial reference point' },
        { term: 'Loss Aversion', definition: 'Losses feel stronger than equal gains' },
        { term: 'FOMO', definition: 'Fear of missing out on rewards others get' },
        { term: 'Endowment Effect', definition: 'Overvaluing what you already own' },
      ],
      fun_fact: 'People react about twice as strongly to losses vs equivalent gains.',
      real_world_example: '“Was $89.99” anchors perceived value.',
    },
    {
      title: 'Sunk Cost Fallacy',
      content:
        '**Sunk costs** are unrecoverable and should not drive forward choices—only future costs/benefits matter. Bad movies, bad projects, and bad stocks tempt this error.\n\n**Opportunity cost** is the next-best alternative given up.',
      key_terms: [
        { term: 'Sunk Cost', definition: 'Irrecoverable past expenditure' },
        { term: 'Sunk Cost Fallacy', definition: 'Continuing due to past investment' },
        { term: 'Opportunity Cost', definition: 'Value of the next-best foregone option' },
      ],
      fun_fact: 'The Concorde was famously continued partly due to sunk political capital.',
      real_world_example: 'Unused gym memberships still paid “to not waste money”—but more money is wasted by continuing.',
    },
    {
      title: 'Herd Behavior & Confirmation Bias',
      content:
        '**Herding** follows crowds assuming wisdom. **Confirmation bias** notices only agreeing evidence—dangerous in investing.\n\nSlow down; seek disconfirming facts.',
      key_terms: [
        { term: 'Herd Behavior', definition: 'Copying majority actions' },
        { term: 'Confirmation Bias', definition: 'Favoring information that supports prior beliefs' },
        { term: 'Social Proof', definition: 'Assuming popularity implies correctness' },
        { term: 'Bubble', definition: 'Prices detach from fundamentals with speculation' },
      ],
      fun_fact: 'Tulip mania is a classic bubble story.',
      real_world_example: 'Meme-stock surges showed social herding in real time.',
    },
  ],
  challenges: [
    {
      type: 'MULTIPLE_CHOICE',
      question: 'What does behavioral economics study?',
      options: [
        'How governments set economic policy',
        'How psychological factors influence economic decisions',
        'How supply and demand determine prices',
        'How banks create money',
      ],
      correct_answer: 'How psychological factors influence economic decisions',
      explanation: 'It explains “predictably irrational” choices.',
      difficulty: 'BEGINNER',
      time_limit: 25,
      xp_reward: 10,
    },
    {
      type: 'SCENARIO',
      question:
        "A store advertises a jacket as 'Originally $200, NOW $79!' You feel like it's a great deal. What cognitive bias is the store exploiting?",
      options: ['Loss aversion', 'Sunk cost fallacy', 'Anchoring bias', 'Herd behavior'],
      correct_answer: 'Anchoring bias',
      explanation: '$200 sets a high reference anchor.',
      difficulty: 'BEGINNER',
      time_limit: 30,
      xp_reward: 10,
    },
    {
      type: 'TRUE_FALSE',
      question:
        'According to loss aversion, people feel the pain of losing $50 about equally to the pleasure of gaining $50.',
      options: ['True', 'False'],
      correct_answer: 'False',
      explanation: 'Losses typically hurt more than gains feel good.',
      difficulty: 'BEGINNER',
      time_limit: 25,
      xp_reward: 10,
    },
    {
      type: 'MULTIPLE_CHOICE',
      question:
        "You've watched 45 minutes of a bad movie. You want to leave, but you think 'I already paid $15 for the ticket.' This is an example of:",
      options: ['Anchoring bias', 'Herd behavior', 'Sunk cost fallacy', 'Confirmation bias'],
      correct_answer: 'Sunk cost fallacy',
      explanation: 'The ticket price is gone; future time is the real margin.',
      difficulty: 'BEGINNER',
      time_limit: 30,
      xp_reward: 10,
    },
    {
      type: 'SCENARIO',
      question:
        "Bitcoin's price is surging. All your friends are buying it, and social media is full of profits. You buy because 'everyone is doing it.' Which bias is this?",
      options: ['Anchoring bias', 'Confirmation bias', 'Herd behavior', 'Sunk cost fallacy'],
      correct_answer: 'Herd behavior',
      explanation: 'Following crowds without independent analysis.',
      difficulty: 'BEGINNER',
      time_limit: 30,
      xp_reward: 10,
    },
    {
      type: 'FILL_BLANK',
      question:
        'The tendency to seek information that supports your existing beliefs is called __________ bias.',
      options: null,
      correct_answer: 'confirmation',
      explanation: 'Seek diverse evidence to counter this.',
      difficulty: 'BEGINNER',
      time_limit: 30,
      xp_reward: 10,
    },
    {
      type: 'MULTIPLE_CHOICE',
      question: "A company has spent $2 million on a project that isn't working. They should:",
      options: [
        "Continue because they've already invested $2 million",
        'Double their investment to try harder',
        'Evaluate future potential regardless of past spending',
        'Ask competitors what they would do',
      ],
      correct_answer: 'Evaluate future potential regardless of past spending',
      explanation: 'Sunk spend should not dictate forward choice.',
      difficulty: 'BEGINNER',
      time_limit: 30,
      xp_reward: 15,
    },
    {
      type: 'SCENARIO',
      question:
        "A free trial for a streaming service is ending. You rarely use it, but you feel reluctant to cancel because 'I'll lose access.' Which bias is at work?",
      options: ['Herd behavior', 'Anchoring bias', 'Loss aversion', 'Sunk cost fallacy'],
      correct_answer: 'Loss aversion',
      explanation: 'Losing access feels worse than modest foregone “gains.”',
      difficulty: 'BEGINNER',
      time_limit: 30,
      xp_reward: 15,
    },
  ],
};
