#!/usr/bin/env node
/**
 * Generates supabase/seed.sql from the 60-day plan data.
 * Run: node scripts/generate-seed.js > supabase/seed.sql
 */

// ── Inline plan data (mirrors src/data/plan-seed.ts) ─────────────────────────
const PLAN = [
  { day: 1,  phase: "P1", dsa: "Arrays/Hashing patterns: Two Sum, Group Anagrams, Top K Frequent. Time-box each at 25 min.", design: "LLD basics: SOLID principles deep-dive. Write notes with code examples for each.", behavioral: "Inventory: list 8-10 significant projects from your 12 YoE. Tag each with possible STAR themes." },
  { day: 2,  phase: "P1", dsa: "Two Pointers: Valid Palindrome, 3Sum, Container With Most Water, Trapping Rain Water.", design: "LLD: Design a Parking Lot. Write out classes, relationships, write code in your strongest language.", behavioral: "Top 5 stories: Draft Situation+Task for each in 3-4 lines." },
  { day: 3,  phase: "P1", dsa: "Sliding Window: Best Time Buy/Sell Stock, Longest Substring Without Repeat, Min Window Substring.", design: "LLD: Design Snake & Ladder / Tic Tac Toe. Focus on extensibility.", behavioral: "STAR drafting: Draft Action+Result for the 5 stories. Quantify impact wherever possible." },
  { day: 4,  phase: "P1", dsa: "Stack: Valid Parens, Min Stack, Daily Temperatures, Largest Rectangle in Histogram.", design: "Design Patterns: Strategy, Observer, Factory. Code real examples, not toy ones.", behavioral: "Amazon LP mapping: map each story to 1-3 Leadership Principles." },
  { day: 5,  phase: "P1", dsa: "Binary Search variants: Search Rotated Sorted Array, Find Min in Rotated, Median of Two Sorted Arrays.", design: "Design Patterns: Singleton (with thread safety), Builder, Decorator. Code examples.", behavioral: "Tell-me-about-yourself: Practice 90 sec version + 3 min version." },
  { day: 6,  phase: "P1", dsa: "Linked List: Reverse Linked List, Merge K Sorted Lists, LRU Cache, Reorder List.", design: "LLD: Design an LRU Cache with thread safety. Implement in code (Doubly LL + HashMap).", behavioral: "Mock recording: 'Tell me about a time you disagreed with a leader'." },
  { day: 7,  phase: "P1", dsa: "Trees Part 1: Invert Binary Tree, Max Depth, Same Tree, Diameter of Binary Tree, Balanced Binary Tree.", design: "HLD primer: Latency numbers, throughput vs latency, CAP theorem, ACID vs BASE.", behavioral: "Reason for switching: Write and polish for 12 YoE narrative." },
  { day: 8,  phase: "P1", dsa: "Trees Part 2: BFS Level Order, Right Side View, LCA of Binary Tree, Validate BST.", design: "HLD primer: Load balancing, reverse proxies, CDN, caching strategies (cache-aside, write-through, write-back).", behavioral: "Most challenging technical problem: Draft full STAR." },
  { day: 9,  phase: "P1", dsa: "Trees Part 3: Serialize/Deserialize Binary Tree, Path Sum III, Kth Smallest in BST, Construct from Preorder+Inorder.", design: "HLD: SQL vs NoSQL, indexes, B-trees, LSM-trees.", behavioral: "Big risk story: Draft STAR for 'Time you took a big risk'." },
  { day: 10, phase: "P1", dsa: "Heap/Priority Queue: Top K Frequent Elements, K Closest Points to Origin, Find Median from Data Stream, Task Scheduler.", design: "LLD: Design Library Management System. Focus on entity modeling and API design.", behavioral: "Mentorship story: 'Time you mentored or grew an engineer'." },
  { day: 11, phase: "P1", dsa: "Backtracking: Subsets, Permutations, Combination Sum, Word Search, N-Queens.", design: "HLD: Sharding, replication (master-slave, master-master), consistent hashing.", behavioral: "Failure story: Draft STAR for failure and what you learned. Avoid trivial failures." },
  { day: 12, phase: "P1", dsa: "Graphs Part 1: Number of Islands, Clone Graph, Course Schedule, Pacific Atlantic Water Flow.", design: "HLD: Message queues — Kafka vs RabbitMQ vs SQS. Pub-sub vs queue.", behavioral: "Conflict story: 'Conflict with peer or manager'. Draft. Tone matters." },
  { day: 13, phase: "P1", dsa: "Graphs Part 2: Topological Sort, Word Ladder, Alien Dictionary, Min Cost Connect Points (MST).", design: "LLD: Design ATM / Vending Machine — state machine pattern.", behavioral: "Behavioral mock: Pick 3 prompts from Amazon LP list, answer aloud." },
  { day: 14, phase: "P1", dsa: "DP Part 1 (1D): Climbing Stairs, House Robber, House Robber II, Coin Change, Word Break, Longest Increasing Subsequence.", design: "HLD: Rate limiter design. Token bucket, leaky bucket, sliding window. Code the algorithm too.", behavioral: "Behavioral mock: Googleyness and leadership prompts." },
  { day: 15, phase: "P1", dsa: "Phase 1 review: Re-solve 5 random problems from Days 1-14 cold. Identify patterns you missed.", design: "Phase 1 review: Refactor at least one LLD design from Days 2, 6, 10, 13 for cleaner abstraction.", behavioral: "Phase 1 retrospective: Write what's still weak and adjust Phase 2 priorities." },
  { day: 16, phase: "P2", dsa: "DP Part 2 (2D): Longest Common Subsequence, Edit Distance, Unique Paths, 0/1 Knapsack.", design: "HLD Case Study — URL Shortener: Design TinyURL end-to-end (reqs, capacity, API, schema, scaling).", behavioral: "Refine top 3 stories with quantified impact. Replace 'I did X' with 'I led X resulting in Y'." },
  { day: 17, phase: "P2", dsa: "DP Part 3 (Hard): Longest Palindromic Subsequence, Distinct Subsequences, Burst Balloons, Regular Expression Matching.", design: "URL Shortener deep-dive: Base62 vs hashing, DB choice, cache design, analytics layer.", behavioral: "Story drill: 2 prompts cold, 5 min each, no notes." },
  { day: 18, phase: "P2", dsa: "Intervals: Merge Intervals, Insert Interval, Non-overlapping Intervals, Meeting Rooms II.", design: "HLD Case Study — File Storage: Design Pastebin / Dropbox. Focus on storage, metadata, chunking.", behavioral: "Manager round: 'How do you give critical feedback?' Draft answer." },
  { day: 19, phase: "P2", dsa: "Greedy: Jump Game, Gas Station, Hand of Straights, Merge Triplets to Form Target.", design: "HLD Case Study — Twitter/News Feed: Fan-out write vs fan-out read trade-offs.", behavioral: "Manager round: 'How do you handle an underperformer?' Draft." },
  { day: 20, phase: "P2", dsa: "Bit Manipulation + Math: Single Number, Counting Bits, Reverse Bits, Missing Number, Pow(x,n).", design: "Twitter/Feed deep-dive: Timeline storage, celebrity problem, push vs pull, Redis sorted sets.", behavioral: "Manager round: 'How do you prioritize work for your team?' Draft." },
  { day: 21, phase: "P2", dsa: "Weekend hard set: Solve 1 hard problem from each of DP, Graphs, Trees. 45 min each then study optimal.", design: "HLD Case Study — WhatsApp/Chat: Long polling vs WebSocket vs SSE. Online presence.", behavioral: "Behavioral mock: 30 min session, 3 stories with friend or AI." },
  { day: 22, phase: "P2", dsa: "Tagged — Google/Meta: 10 LeetCode problems tagged for your primary target company.", design: "WhatsApp deep-dive: Group chat, message ordering, end-to-end encryption basics.", behavioral: "Biggest impact story: Refine 'biggest impact you've had'. This is THE story for senior level." },
  { day: 23, phase: "P2", dsa: "Tagged — Amazon: 10 LC problems tagged Amazon. Note Amazon style: graph/heap/string-heavy.", design: "HLD Case Study — Uber/Ride-sharing: Geohashing, quad-trees, matching algorithm.", behavioral: "Influence without authority story: Critical at staff level." },
  { day: 24, phase: "P2", dsa: "Tries: Implement Trie, Design Add+Search Words, Word Search II.", design: "Uber deep-dive: Real-time location updates, surge pricing, ETA computation.", behavioral: "Biggest weakness: Prepare a real one with concrete improvement steps." },
  { day: 25, phase: "P2", dsa: "Advanced Graphs: Network Delay Time (Dijkstra), Cheapest Flights K Stops, Swim in Rising Water.", design: "LLD Deep Dive — Splitwise: Expense sharing and debt simplification algorithm.", behavioral: "Bar Raiser prep: 4 LP-mapped stories rapid fire (if Amazon target)." },
  { day: 26, phase: "P2", dsa: "Strings: Longest Palindromic Substring, Minimum Window Substring revisit, KMP string matching.", design: "HLD Case Study — YouTube/Netflix: Video upload pipeline, encoding, CDN, recommendations.", behavioral: "Tech lead question: 'How do you make a tech decision when team disagrees?'" },
  { day: 27, phase: "P2", dsa: "Union-Find: Number of Connected Components, Redundant Connection, Accounts Merge.", design: "YouTube deep-dive: Storage at scale, DASH/HLS streaming, view count consistency.", behavioral: "Tech lead question: 'How do you handle technical debt vs feature delivery?'" },
  { day: 28, phase: "P2", dsa: "Mock Interview #1: 60 min DSA session. 2 problems on LeetCode in interview mode or paid platform.", design: "HLD Case Study — Search Autocomplete: Trie at scale + search ranking basics.", behavioral: "Self-review mock answers: Are you concise? Cut filler words." },
  { day: 29, phase: "P2", dsa: "Review Mock #1 weaknesses. Re-solve missed problems. Study optimal patterns.", design: "HLD: Idempotency, distributed transactions, saga pattern, two-phase commit.", behavioral: "Critical incident story: 'Time you owned an outage'. Strong senior signal." },
  { day: 30, phase: "P2", dsa: "Sliding Window hard: Subarrays with K Different Integers, Minimum Window Substring revisit.", design: "HLD: Observability — logs, metrics, traces. SLO/SLI/SLA definitions.", behavioral: "Why this company: Refine for top 2 target companies. Specific not generic." },
  { day: 31, phase: "P2", dsa: "Graph hard set: Word Ladder II, Bus Routes, Reconstruct Itinerary.", design: "HLD Case Study — Notification System: Multi-channel, dedup, rate limiting per user.", behavioral: "Simplification story: 'Time you simplified something complex' — architecture or process." },
  { day: 32, phase: "P2", dsa: "DP hard set: Best Time to Buy/Sell Stock with Cooldown, Best Time to Buy/Sell Stock IV, Dungeon Game.", design: "HLD Case Study — Distributed Cache (Redis): Eviction, replication, hot-key problem.", behavioral: "Cross-team collaboration story: 'Dependency you led across teams'." },
  { day: 33, phase: "P2", dsa: "Heap + Greedy combo: IPO, Reorganize String, Furthest Building You Can Reach.", design: "HLD: API design — REST vs gRPC vs GraphQL. Versioning. Pagination strategies.", behavioral: "Story drill: 4 prompts, 4 min each, time yourself strictly." },
  { day: 34, phase: "P2", dsa: "Matrix problems: Spiral Matrix, Rotate Image, Set Matrix Zeros, Word Search.", design: "HLD Case Study — Google Drive: Collaborative editing primer (OT vs CRDT awareness).", behavioral: "Amazon LP final pass: Cover 14-16 stories minimum if targeting Amazon." },
  { day: 35, phase: "P2", dsa: "Phase 2 retrospective: Identify 2 weakest topics. Plan extra hours for them in Phase 3.", design: "HLD Case Study — Metrics/Monitoring System: Design Datadog-style system.", behavioral: "Read failure mode stories online (Pragmatic Engineer, Levels.fyi) to recalibrate bar." },
  { day: 36, phase: "P3", dsa: "Mock Interview #2: 60 min DSA, recorded. Use Pramp / Interviewing.io / friend.", design: "HLD Mock #1: 45 min on a system you haven't designed yet. Record yourself.", behavioral: "HLD mock review: Cover reqs, capacity, API, data model, HLD, deep-dive, trade-offs?" },
  { day: 37, phase: "P3", dsa: "Review Mock #2: Re-solve problems. Study editorial. Did you communicate while coding?", design: "HLD Case Study — Instagram: Photo sharing, feed algorithm, storage tiering.", behavioral: "Why leaving current role: Polish answer — never blame, frame forward." },
  { day: 38, phase: "P3", dsa: "Tagged — Company #1: 10 LC problems for your primary target, focus on 30-day frequency.", design: "HLD Case Study — Distributed Logging: ELK stack at scale.", behavioral: "Behavioral mock round: 30 min, 4 stories, get harsh feedback." },
  { day: 39, phase: "P3", dsa: "Tagged — Company #2: 10 LC problems for your secondary target.", design: "HLD: Multi-region active-active vs active-passive. Disaster recovery (RPO/RTO).", behavioral: "Record tell-me-about-yourself: Watch back, fix awkwardness." },
  { day: 40, phase: "P3", dsa: "Hard problem deep-dive: Pick 1 LC Hard, spend 90 min understanding 3 different solutions.", design: "LLD Mock: Design Stack Overflow / Q&A site code-level. 60 min, write actual code.", behavioral: "Pushback story: 'Time you said no to a senior leader / pushed back'. Staff level signal." },
  { day: 41, phase: "P3", dsa: "Mock Interview #3: 90 min DSA — 2 mediums + 1 hard on Pramp or Interviewing.io.", design: "HLD Case Study — Slack/Discord: Channels, presence at scale, message search.", behavioral: "Mock #3 review: Are you starting with brute force? Communicating trade-offs?" },
  { day: 42, phase: "P3", dsa: "Weekend stamina test: 3 x 45 min DSA mock sessions back-to-back. Endurance focus.", design: "HLD Mock #2: 60 min on a different system from mock #1.", behavioral: "Behavioral mock: 5 prompts, 5 min each. Sustain energy across all 5." },
  { day: 43, phase: "P3", dsa: "Recovery day: Re-solve 5 problems you've struggled with most. Spaced repetition.", design: "HLD Mock #2 review: List 5 things you'd say differently next time.", behavioral: "Salary/leveling research: levels.fyi, Blind, Glassdoor for target companies." },
  { day: 44, phase: "P3", dsa: "Speed drill — Trees + Graphs: 6 problems, 25 min each. Speed focus.", design: "HLD Case Study — Online Code Editor: Sandboxing, real-time execution (Leetcode/Replit).", behavioral: "Negotiation prep: Read 'Ten Rules for Negotiating' (haseebq) if not done." },
  { day: 45, phase: "P3", dsa: "Speed drill — DP + Backtracking: 5 problems, 30 min each.", design: "HLD Case Study — Booking System: Inventory locking, double-booking prevention (Airbnb/Hotel).", behavioral: "Questions for interviewer: Prepare 3 sharp questions per round type." },
  { day: 46, phase: "P3", dsa: "Mock Interview #4: DSA focused on your weakest topic from previous mocks.", design: "LLD Mock — Movie Booking System: BookMyShow with concurrency around seat locking.", behavioral: "Self-recorded behavioral: 30 min, 5 prompts. Watch back." },
  { day: 47, phase: "P3", dsa: "Review Mock #4: Patterns missed? Speed issues? Communication gaps?", design: "HLD: Feature flags, A/B testing infra, gradual rollouts. Senior signal.", behavioral: "STAR pruning: Take a 6 min answer and cut it to 3 min without losing impact." },
  { day: 48, phase: "P3", dsa: "Onsite simulation: 4 x 45 min DSA + 1 hour break + behavioral. Full endurance test.", design: "Review existing case study notes. No new HLD content today.", behavioral: "Endurance assessment: How was hour 5? Plan rest before real onsite." },
  { day: 49, phase: "P3", dsa: "Light DSA day: 3 LC mediums, no time pressure. Read editorials.", design: "HLD Case Study — Payment System: Idempotency, double-charge prevention, ledger.", behavioral: "Final story bank: Compile 12-15 polished stories indexed by theme." },
  { day: 50, phase: "P3", dsa: "Phase 3 retrospective: Are mock scores trending up? Identify final 2-3 gaps.", design: "HLD Case Study — Distributed Job Scheduler: Cron at scale.", behavioral: "Behavioral mock with senior engineer: Get honest feedback." },
  { day: 51, phase: "P4", dsa: "Must-know set: LRU Cache, LFU Cache, Find Median from Data Stream, Trapping Rain Water.", design: "HLD speed-run: Pick 5 case studies from your notes, do 10-min outlines each.", behavioral: "Read engineering blogs: Anthropic/Google/Meta — have a recent thing to discuss." },
  { day: 52, phase: "P4", dsa: "Tagged — Final pass: 8 problems for your top target, mix of high-frequency tags.", design: "Target company HLD: Design a system specific to your target company's product.", behavioral: "Top 5 stories final pass: Record once, listen for filler words (um, like, sort of)." },
  { day: 53, phase: "P4", dsa: "Mock Interview #5: Full DSA simulation. 60 min, recorded. Solo or paid platform.", design: "HLD Mock #3: Focus on deep-dive component, not just high level.", behavioral: "Behavioral mock #3: Timed, 30 min, recorded." },
  { day: 54, phase: "P4", dsa: "Review all mocks: Identify common gaps. Do 3 problems on those gaps.", design: "HLD weak areas review: Capacity estimation accuracy, deep-dive specificity.", behavioral: "Crisis stories: Compile top 3 — performance issues, outages, conflicts. Polish them." },
  { day: 55, phase: "P4", dsa: "Light: 2 LC mediums you've solved before, time them, aim for under 20 min each.", design: "HLD: DB internals deep-dive — B-tree vs LSM, isolation levels (common follow-ups).", behavioral: "Question bank: Refresh your questions for each interviewer type." },
  { day: 56, phase: "P4", dsa: "Speed drill: 5 LC easies in 60 min. Should feel automatic now.", design: "LLD speed-run: Re-implement Parking Lot, LRU Cache, BookMyShow seat locking from memory.", behavioral: "Negotiation script: Practice with specific numbers, ranges, walk-away point." },
  { day: 57, phase: "P4", dsa: "Cool-down: Re-solve 3 problems from Day 1. Measure how much faster you are.", design: "HLD numbers review: Latency by component, QPS estimation, storage math.", behavioral: "Why FAANG / why now: Polish your 12 YoE story arc." },
  { day: 58, phase: "P4", dsa: "Light: 2 problems max. Don't burn out.", design: "HLD outlines: 2 case studies in 30 min each, outlines only.", behavioral: "Behavioral final mock: Go in fresh, treat as real interview." },
  { day: 59, phase: "P4", dsa: "Rest day: Review notes only. Walk, exercise, sleep early. No new problems.", design: "Rest day: Skim HLD case study one-liners only.", behavioral: "Mental prep: Visualize the interview going well. Check logistics." },
  { day: 60, phase: "P4", dsa: "Warm-up: 1 easy problem for confidence. Then STOP.", design: "Review your HLD framework one-pager only.", behavioral: "Apply and schedule interviews. You're ready." },
];

// ── Parsing helpers ───────────────────────────────────────────────────────────

/**
 * Parse a text like "Section title: item1, item2, item3. Context note."
 * Returns { sectionTitle, contextNote, items }
 */
function parseEntry(text, track) {
  let prefix = '';
  let working = text;

  // Detect a prefix sentence before "SectionTitle: items"
  // e.g. "Weekend long session. Trees Part 1: Invert, Max Depth"
  const prefixMatch = working.match(/^([^:]+\.\s+)(.+:.+)$/s);
  if (prefixMatch && !prefixMatch[1].includes(':')) {
    prefix = prefixMatch[1].trim();
    working = prefixMatch[2];
  }

  const colonIdx = working.indexOf(':');
  if (colonIdx === -1) {
    // No colon — treat whole thing as single task
    return {
      sectionTitle: track === 'DSA' ? 'Practice' : track === 'DESIGN' ? 'Design Task' : 'Behavioral Task',
      contextNote: null,
      items: [{ title: working.replace(/\.$/, '').trim() }],
    };
  }

  const sectionTitle = working.substring(0, colonIdx).trim();
  const rest = working.substring(colonIdx + 1).trim();

  // Split rest into "items sentence" + "context note"
  // Strategy: find first ". " and split there, but only if first part has commas
  let itemsText = rest.replace(/\.$/, '').trim();
  let contextNote = prefix || null;

  const firstPeriodMatch = rest.match(/^([^.]+)\.\s+(.+)$/s);
  if (firstPeriodMatch) {
    const candidate = firstPeriodMatch[1];
    const tail = firstPeriodMatch[2].replace(/\.$/, '').trim();
    // If candidate contains commas it's likely a list of questions
    if (candidate.includes(',')) {
      itemsText = candidate.trim();
      contextNote = [prefix, tail].filter(Boolean).join(' ') || null;
    }
  }

  // Split items by comma for DSA (short individual question names)
  const rawItems = itemsText.split(',').map(s => s.trim()).filter(Boolean);

  // For DSA: split into individual questions if they look like short problem names
  // For DESIGN/BEHAVIORAL: keep as single task
  let items;
  if (track === 'DSA' && rawItems.length > 1 && rawItems.every(i => i.length < 65)) {
    items = rawItems.map(t => ({ title: t }));
  } else {
    items = [{ title: itemsText.replace(/\.$/, '').trim() }];
  }

  return { sectionTitle, contextNote, items };
}

// ── SQL escape helper ─────────────────────────────────────────────────────────
function esc(s) {
  if (s === null || s === undefined) return 'NULL';
  return `'${String(s).replace(/'/g, "''")}'`;
}

// ── Generate SQL ──────────────────────────────────────────────────────────────
const lines = [];

lines.push(`-- ============================================================`);
lines.push(`-- Auto-generated seed: plan_days + plan_sections + plan_items`);
lines.push(`-- Generated by scripts/generate-seed.js`);
lines.push(`-- ============================================================`);
lines.push(``);

// 1. Upsert plan_days (just day_number + phase now)
lines.push(`-- ── plan_days ────────────────────────────────────────────────`);
lines.push(`insert into public.plan_days (day_number, phase, dsa_description, design_description, behavioral_description)`);
lines.push(`values`);
const dayRows = PLAN.map((d, i) => {
  const comma = i < PLAN.length - 1 ? ',' : '';
  return `  (${d.day}, ${esc(d.phase)}, ${esc(d.dsa)}, ${esc(d.design)}, ${esc(d.behavioral)})${comma}`;
});
lines.push(...dayRows);
lines.push(`on conflict (day_number) do update`);
lines.push(`  set phase = excluded.phase,`);
lines.push(`      dsa_description = excluded.dsa_description,`);
lines.push(`      design_description = excluded.design_description,`);
lines.push(`      behavioral_description = excluded.behavioral_description;`);
lines.push(``);

// 2. Clear existing sections/items (idempotent)
lines.push(`-- ── Clear & re-seed sections / items ────────────────────────`);
lines.push(`delete from public.plan_sections;`);
lines.push(``);

// 3. Insert sections + items per day
const TRACKS = ['DSA', 'DESIGN', 'BEHAVIORAL'];

for (const day of PLAN) {
  for (const track of TRACKS) {
    const text = track === 'DSA' ? day.dsa : track === 'DESIGN' ? day.design : day.behavioral;
    const { sectionTitle, contextNote, items } = parseEntry(text, track);

    lines.push(`-- Day ${day.day} · ${track}`);
    lines.push(`do $$`);
    lines.push(`declare v_sec uuid;`);
    lines.push(`begin`);
    lines.push(`  insert into public.plan_sections (day_number, track, title, context_note, sort_order)`);
    lines.push(`  values (${day.day}, ${esc(track)}, ${esc(sectionTitle)}, ${esc(contextNote)}, 0)`);
    lines.push(`  returning id into v_sec;`);
    lines.push(``);
    items.forEach((item, idx) => {
      lines.push(`  insert into public.plan_items (section_id, title, sort_order)`);
      lines.push(`  values (v_sec, ${esc(item.title)}, ${idx});`);
    });
    lines.push(`end $$;`);
    lines.push(``);
  }
}

console.log(lines.join('\n'));
