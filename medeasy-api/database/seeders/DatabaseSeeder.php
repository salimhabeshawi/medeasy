<?php

namespace Database\Seeders;

use App\Models\Chapter;
use App\Models\ContentItem;
use App\Models\Course;
use App\Models\Topic;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Change this email/password before running in anything but local
        // dev — this is just so you have an admin account on day one.
        $admin = User::firstOrCreate(
            ['email' => 'admin@medeasy.test'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'is_super_admin' => true,
                'email_verified_at' => now(),
            ]
        );

        foreach ($this->courses() as $courseData) {
            $this->seedCourse($courseData, $admin);
        }
    }

    private function seedCourse(array $data, User $admin): void
    {
        $course = Course::firstOrCreate(
            ['slug' => $data['slug']],
            [
                'title' => $data['title'],
                'description' => $data['description'],
                'is_published' => true,
                'created_by' => $admin->id,
            ]
        );

        foreach ($data['chapters'] as $chapterData) {
            $chapter = Chapter::firstOrCreate(
                ['course_id' => $course->id, 'slug' => $chapterData['slug']],
                [
                    'title' => $chapterData['title'],
                    'description' => $chapterData['description'] ?? null,
                    'order_index' => $chapterData['order_index'],
                ]
            );

            foreach ($chapterData['topics'] as $topicData) {
                $topic = Topic::firstOrCreate(
                    ['chapter_id' => $chapter->id, 'slug' => $topicData['slug']],
                    [
                        'title' => $topicData['title'],
                        'order_index' => $topicData['order_index'],
                    ]
                );

                foreach ($topicData['content'] as $index => $item) {
                    ContentItem::firstOrCreate(
                        ['topic_id' => $topic->id, 'title' => $item['title']],
                        [
                            'type' => $item['type'],
                            'body' => $item['body'] ?? null,
                            'youtube_url' => $item['youtube_url'] ?? null,
                            'order_index' => $index + 1,
                        ]
                    );
                }
            }
        }
    }

    private function courses(): array
    {
        return [
            [
                'slug' => 'human-anatomy',
                'title' => 'Human Anatomy',
                'description' => 'Core anatomy concepts every med student needs cold.',
                'chapters' => [
                    [
                        'slug' => 'the-heart',
                        'title' => 'The Heart',
                        'description' => 'Cardiac anatomy, chambers, valves, and circulation.',
                        'order_index' => 1,
                        'topics' => [
                            [
                                'slug' => 'cardiac-chambers',
                                'title' => 'Cardiac Chambers',
                                'order_index' => 1,
                                'content' => [
                                    [
                                        'title' => 'Overview: The Four Chambers',
                                        'type' => 'text',
                                        'body' => <<<'TXT'
The heart has four chambers: two atria (left and right) and two ventricles (left and right).

- The right atrium receives deoxygenated blood from the systemic circulation via the superior and inferior vena cavae.
- The right ventricle pumps that blood to the lungs through the pulmonary trunk.
- The left atrium receives oxygenated blood from the lungs via the four pulmonary veins.
- The left ventricle pumps oxygenated blood into the systemic circulation through the aorta. Its muscular wall is the thickest because it works against the highest pressure.

Key exam facts:
- The tricuspid valve separates the right atrium from the right ventricle.
- The bicuspid (mitral) valve separates the left atrium from the left ventricle.
- Septal defects are named by the location of the missing tissue: atrial septal defect (ASD) and ventricular septal defect (VSD).
TXT,
                                    ],
                                    [
                                        'title' => 'Cardiac Chambers Explained (video)',
                                        'type' => 'video',
                                        'youtube_url' => 'https://www.youtube.com/watch?v=IS9TD9fHFv0',
                                    ],
                                ],
                            ],
                            [
                                'slug' => 'cardiac-cycle',
                                'title' => 'The Cardiac Cycle',
                                'order_index' => 2,
                                'content' => [
                                    [
                                        'title' => 'The Wiggers Diagram',
                                        'type' => 'markdown',
                                        'body' => <<<'TXT'
The cardiac cycle is one heartbeat, roughly **0.8 seconds** at 75 bpm. It has two halves:

1. **Systole** — ventricular contraction and ejection.
2. **Diastole** — ventricular relaxation and filling.

## Phases in order

| Phase | Valves | Key event |
| --- | --- | --- |
| Atrial systole | AV valves open | "Atrial kick" tops off ventricular filling |
| Isovolumetric contraction | All closed | Pressure rises, volume constant |
| Rapid ejection | Semilunar open | Blood exits ventricles |
| Reduced ejection | Semilunar open | Pressure falls |
| Isovolumetric relaxation | All closed | Pressure crashes, volume constant |
| Rapid filling | AV valves open | Passive ventricular filling |
| Diastasis | AV valves open | Slow filling before the next beat |

## Sounds

- **S1** — closure of the AV (mitral + tricuspid) valves.
- **S2** — closure of the semilunar (aortic + pulmonary) valves.
TXT,
                                    ],
                                    [
                                        'title' => 'The Best Wiggers Diagram Lesson (video)',
                                        'type' => 'video',
                                        'youtube_url' => 'https://www.youtube.com/watch?v=Z4qwkFJaoms',
                                    ],
                                ],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'upper-limb',
                        'title' => 'Upper Limb',
                        'description' => 'Bones, muscles, nerves, and the brachial plexus.',
                        'order_index' => 2,
                        'topics' => [
                            [
                                'slug' => 'brachial-plexus',
                                'title' => 'The Brachial Plexus',
                                'order_index' => 1,
                                'content' => [
                                    [
                                        'title' => 'Roots, Trunks, Divisions, Cords, Branches',
                                        'type' => 'text',
                                        'body' => <<<'TXT'
The brachial plexus is formed by the ventral rami of C5–T1 and supplies the entire upper limb. Remember the order with "Randy Travis Drinks Cold Beer": Roots, Trunks, Divisions, Cords, Branches.

- Roots (C5–T1) emerge between the scalene muscles.
- Trunks: superior (C5–C6), middle (C7), inferior (C8–T1).
- Divisions: each trunk splits into anterior and posterior.
- Cords: lateral, medial, and posterior, named by their relation to the axillary artery.
- Branches: the five terminal branches are musculocutaneous, median, ulnar, radial, and axillary nerves.

High-yield injuries:
- Erb-Duchenne palsy (C5–C6): "waiter's tip" position.
- Klumpke palsy (C8–T1): claw hand from ulnar nerve involvement.
TXT,
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'slug' => 'human-physiology',
                'title' => 'Human Physiology',
                'description' => 'How the healthy body works: cardiovascular, renal, and respiratory physiology.',
                'chapters' => [
                    [
                        'slug' => 'cardiovascular-physiology',
                        'title' => 'Cardiovascular Physiology',
                        'description' => 'Pressure, flow, and how the heart meets metabolic demand.',
                        'order_index' => 1,
                        'topics' => [
                            [
                                'slug' => 'cardiac-cycle-overview',
                                'title' => 'Cardiac Cycle',
                                'order_index' => 1,
                                'content' => [
                                    [
                                        'title' => 'Systole and Diastole',
                                        'type' => 'text',
                                        'body' => <<<'TXT'
Cardiac output = heart rate × stroke volume. Normal cardiac output is about 5 L/min.

Stroke volume is driven by three factors:

- Preload — end-diastolic ventricular wall tension (Frank-Starling law: more filling → stronger contraction).
- Afterload — the pressure the ventricle must overcome to eject (systemic vascular resistance).
- Contractility — the inotropic state of the myocardium (sympathetic tone increases it).

Starling forces at the capillaries balance hydrostatic pressure against oncotic (colloid osmotic) pressure. Filtration at the arterial end and reabsorption at the venous end keep interstitial fluid in balance; imbalance produces edema.
TXT,
                                    ],
                                    [
                                        'title' => 'The Cardiac Cycle, Animation (video)',
                                        'type' => 'video',
                                        'youtube_url' => 'https://www.youtube.com/watch?v=IS9TD9fHFv0',
                                    ],
                                ],
                            ],
                            [
                                'slug' => 'blood-pressure-regulation',
                                'title' => 'Blood Pressure Regulation',
                                'order_index' => 2,
                                'content' => [
                                    [
                                        'title' => 'Baroreceptors and the RAAS',
                                        'type' => 'text',
                                        'body' => <<<'TXT'
Mean arterial pressure (MAP) = diastolic pressure + 1/3 pulse pressure, or MAP = CO × SVR.

Short-term control is the baroreceptor reflex:

- Carotid sinus and aortic arch baroreceptors sense stretch.
- A drop in pressure reduces afferent firing → less vagal tone, more sympathetic outflow → vasoconstriction, faster heart rate, stronger contraction.

Long-term control is the renin-angiotensin-aldosterone system (RAAS):

- Juxtaglomerular cells release renin in response to low renal perfusion pressure, low distal sodium delivery, or sympathetic stimulation.
- Angiotensin II is a powerful vasoconstrictor and stimulates aldosterone release, which promotes sodium and water reabsorption — raising blood volume and pressure.
TXT,
                                    ],
                                    [
                                        'title' => 'The Best Wiggers Diagram Lesson (video)',
                                        'type' => 'video',
                                        'youtube_url' => 'https://www.youtube.com/watch?v=Z4qwkFJaoms',
                                    ],
                                ],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'renal-physiology',
                        'title' => 'Renal Physiology',
                        'description' => 'The nephron, filtration, and fluid/electrolyte balance.',
                        'order_index' => 2,
                        'topics' => [
                            [
                                'slug' => 'nephron-function',
                                'title' => 'The Nephron',
                                'order_index' => 1,
                                'content' => [
                                    [
                                        'title' => 'Filtration, Reabsorption, Secretion',
                                        'type' => 'markdown',
                                        'body' => <<<'TXT'
The nephron is the functional unit of the kidney. Urine formation happens in four steps:

1. **Filtration** — the glomerulus filters ~180 L/day; only ~1.5 L is excreted.
2. **Reabsorption** — water and solutes move from the tubule back into the blood.
3. **Secretion** — solutes (H+, K+, drugs) move from the blood into the tubule.
4. **Excretion** — final product leaves via the ureter.

## Segments and their jobs

| Segment | Reabsorbs | Secretes |
| --- | --- | --- |
| Proximal convoluted tubule | Most Na+, glucose, amino acids, HCO3-, water | H+, creatinine, some drugs |
| Descending limb (loop of Henle) | Water | — |
| Ascending limb (loop of Henle) | Na+, K+, Cl- | — |
| Distal convoluted tubule | Na+, Ca2+ | H+, K+ |
| Collecting duct | Na+, water, urea | H+ |

GFR is normally about 125 mL/min. Net filtration pressure = glomerular hydrostatic pressure − (Bowman's capsule pressure + glomerular colloid osmotic pressure).
TXT,
                                    ],
                                    [
                                        'title' => 'Chronic Kidney Disease Pathophysiology (video)',
                                        'type' => 'video',
                                        'youtube_url' => 'https://www.youtube.com/watch?v=JjcqY95HR1o',
                                    ],
                                ],
                            ],
                            [
                                'slug' => 'acid-base-balance',
                                'title' => 'Acid-Base Balance',
                                'order_index' => 2,
                                'content' => [
                                    [
                                        'title' => 'Respiratory and Metabolic Compensation',
                                        'type' => 'text',
                                        'body' => <<<'TXT'
Normal arterial pH is 7.35–7.45, maintained by buffers, the lungs, and the kidneys.

Primary disturbances:
- Respiratory acidosis — hypoventilation → high PaCO2.
- Respiratory alkalosis — hyperventilation → low PaCO2.
- Metabolic acidosis — low bicarbonate (DKA, diarrhea, renal failure).
- Metabolic alkalosis — high bicarbonate (vomiting, diuretics).

Compensation:
- Lungs respond within minutes by adjusting ventilation.
- Kidneys respond within hours to days by excreting or retaining HCO3- and H+.

Remember: pH changes follow the "R" (respiratory) and "M" (metabolic) pairs, and the compensatory system always pushes pH back toward normal but rarely all the way.
TXT,
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'slug' => 'pharmacology',
                'title' => 'Pharmacology',
                'description' => 'Drug classes, mechanisms of action, and high-yield side effects.',
                'chapters' => [
                    [
                        'slug' => 'antimicrobials',
                        'title' => 'Antimicrobials',
                        'description' => 'Beta-lactams, protein synthesis inhibitors, and resistance.',
                        'order_index' => 1,
                        'topics' => [
                            [
                                'slug' => 'beta-lactams',
                                'title' => 'Beta-Lactam Antibiotics',
                                'order_index' => 1,
                                'content' => [
                                    [
                                        'title' => 'Penicillins, Cephalosporins, and Resistance',
                                        'type' => 'markdown',
                                        'body' => <<<'TXT'
Beta-lactams share a **beta-lactam ring** and kill bacteria by inhibiting cell-wall (peptidoglycan) synthesis.

## Mechanism

- Bacteria cross-link peptidoglycan using **penicillin-binding proteins (PBPs)**, a.k.a. DD-transpeptidases.
- Beta-lactams resemble the substrate, bind PBPs irreversibly, and stop cross-linking → the cell wall weakens and the bacterium lyses. They are **bactericidal**.

## Major classes

| Class | Examples | Notes |
| --- | --- | --- |
| Penicillins | Penicillin G/V, amoxicillin, piperacillin | Basic, aminopenicillins, antistaphylococcal, antipseudomonal |
| Cephalosporins | 1st–5th generation | Increasing gram-negative coverage by generation |
| Carbapenems | Meropenem, imipenem | Very broad spectrum |
| Monobactams | Aztreonam | Covers gram-negatives; safe in penicillin allergy |

## Resistance

- **Beta-lactamases** hydrolyze the ring. Fixed with beta-lactamase inhibitors: clavulanic acid, sulbactam, tazobactam.
- **Altered PBPs** (e.g., MRSA PBP2a) — no longer bound by the drug.
- Altered porins and efflux pumps are more common in gram-negatives.
TXT,
                                    ],
                                    [
                                        'title' => 'Beta-Lactams: Mechanisms of Action and Resistance (video)',
                                        'type' => 'video',
                                        'youtube_url' => 'https://www.youtube.com/watch?v=qBdYnRhdWcQ',
                                    ],
                                    [
                                        'title' => 'Penicillin antibiotics — Mechanism of action, side effects and resistance (video)',
                                        'type' => 'video',
                                        'youtube_url' => 'https://www.youtube.com/watch?v=tMEiIYu6J-4',
                                    ],
                                ],
                            ],
                            [
                                'slug' => 'protein-synthesis-inhibitors',
                                'title' => 'Protein Synthesis Inhibitors',
                                'order_index' => 2,
                                'content' => [
                                    [
                                        'title' => 'The 30S and 50S Ribosomal Inhibitors',
                                        'type' => 'text',
                                        'body' => <<<'TXT'
These drugs bind bacterial ribosomes (70S) selectively because human ribosomes are 80S.

30S inhibitors:
- Aminoglycosides (gentamicin, amikacin) — bactericidal; cause ototoxicity and nephrotoxicity.
- Tetracyclines (doxycycline) — bacteriostatic; contraindicated in children and pregnancy (tooth discoloration).
- Tigecycline.

50S inhibitors:
- Macrolides (azithromycin, erythromycin) — bacteriostatic; QT prolongation.
- Clindamycin — associated with C. difficile colitis.
- Chloramphenicol — aplastic anemia, gray baby syndrome.
- Linezolid — MAO inhibition; serotonin syndrome.

Aminoglycosides work best against aerobic gram-negative rods and synergize with beta-lactams (which disrupt the cell wall and let the aminoglycoside in).
TXT,
                                    ],
                                ],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'autonomic-pharmacology',
                        'title' => 'Autonomic Pharmacology',
                        'description' => 'Adrenergic and cholinergic drugs.',
                        'order_index' => 2,
                        'topics' => [
                            [
                                'slug' => 'adrenergic-agonists',
                                'title' => 'Adrenergic Agonists',
                                'order_index' => 1,
                                'content' => [
                                    [
                                        'title' => 'Alpha and Beta Receptor Agonists',
                                        'type' => 'text',
                                        'body' => <<<'TXT'
Adrenergic agonists mimic the sympathetic nervous system.

- Alpha-1: vasoconstriction → used as decongestants (phenylephrine) and vasopressors (norepinephrine).
- Alpha-2: central sympatholysis → clonidine lowers blood pressure.
- Beta-1: increases heart rate, contractility, and renin release → dobutamine for cardiogenic shock.
- Beta-2: bronchodilation and uterine relaxation → albuterol for asthma, terbutaline for preterm labor.
- Beta-3: bladder relaxation → mirabegron for overactive bladder.

Side effects of beta-agonists: tremor, tachycardia, hypokalemia, hyperglycemia. Inhaled beta-2 agonists are first-line for acute asthma.
TXT,
                                    ],
                                ],
                            ],
                            [
                                'slug' => 'cholinergic-agents',
                                'title' => 'Cholinergic Agents',
                                'order_index' => 2,
                                'content' => [
                                    [
                                        'title' => 'Muscarinic and Nicotinic Drugs',
                                        'type' => 'text',
                                        'body' => <<<'TXT'
Cholinergic drugs activate the parasympathetic nervous system.

Direct muscarinic agonists:
- Pilocarpine — used for glaucoma and dry mouth.
- Bethanechol — urinary retention.
- Carbachol — glaucoma.

Anticholinesterases (indirect agonists):
- Neostigmine, pyridostigmine — myasthenia gravis.
- Donepezil, rivastigmine — Alzheimer disease.
- Physostigmine — antidote for atropine toxicity (crosses the blood-brain barrier).

Anticholinergic toxicity (atropine, diphenhydramine): "blind as a bat, mad as a hatter, red as a beet, hot as a hare, dry as a bone." The antidote is physostigmine.
TXT,
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'slug' => 'biochemistry',
                'title' => 'Biochemistry',
                'description' => 'Metabolic pathways, molecular biology, and clinical correlations.',
                'chapters' => [
                    [
                        'slug' => 'metabolism',
                        'title' => 'Metabolism',
                        'description' => 'Carbohydrate metabolism from glucose to oxidative phosphorylation.',
                        'order_index' => 1,
                        'topics' => [
                            [
                                'slug' => 'glycolysis',
                                'title' => 'Glycolysis',
                                'order_index' => 1,
                                'content' => [
                                    [
                                        'title' => 'Ten Steps, Net 2 ATP',
                                        'type' => 'markdown',
                                        'body' => <<<'TXT'
Glycolysis converts one glucose (6C) into two pyruvate (3C) in the cytosol.

**Net yield per glucose:** 2 ATP + 2 NADH + 2 pyruvate.

## Investment vs payoff

| Phase | ATP/NADH |
| --- | --- |
| Energy investment (glucose → fructose-1,6-bisphosphate) | −2 ATP |
| Energy payoff (1,3-BPG → pyruvate) | +4 ATP, +2 NADH |

## Regulatory enzymes

- **Hexokinase** — inhibited by glucose-6-phosphate.
- **PFK-1** — the rate-limiting step; activated by AMP/fructose-2,6-BP, inhibited by ATP and citrate.
- **Pyruvate kinase** — activated by fructose-1,6-BP, inhibited by ATP and alanine.

## Clinical correlations

- **Pyruvate kinase deficiency** → hemolytic anemia (RBCs depend on glycolysis).
- **Arsenic** and **fluoride** poison specific glycolytic enzymes.
- Lactate dehydrogenase (LDH) regenerates NAD+ anaerobically, allowing glycolysis to continue.
TXT,
                                    ],
                                    [
                                        'title' => 'Regulation of Glycolysis (video)',
                                        'type' => 'video',
                                        'youtube_url' => 'https://www.youtube.com/watch?v=xoqyF6DJZ-Y',
                                    ],
                                ],
                            ],
                            [
                                'slug' => 'krebs-cycle',
                                'title' => 'The Krebs Cycle',
                                'order_index' => 2,
                                'content' => [
                                    [
                                        'title' => 'The Citric Acid Cycle',
                                        'type' => 'text',
                                        'body' => <<<'TXT'
The Krebs (citric acid/TCA) cycle runs in the mitochondrial matrix and is the hub of aerobic metabolism.

Per acetyl-CoA entering the cycle:
- 3 NADH, 1 FADH2, 1 GTP (ATP).
- 2 CO2 released (the carbons come from acetyl-CoA).

Regulatory enzymes:
- Citrate synthase — inhibited by ATP, NADH, citrate.
- Isocitrate dehydrogenase — activated by ADP and NAD+, inhibited by ATP and NADH.
- Alpha-ketoglutarate dehydrogenase — inhibited by ATP, NADH, succinyl-CoA.

Glucose → 2 acetyl-CoA gives: 2 GTP + 6 NADH + 2 FADH2. These electron carriers feed the electron transport chain for most of the ATP (~30–32 total per glucose with complete oxidation).
TXT,
                                    ],
                                    [
                                        'title' => 'The Krebs Cycle (video)',
                                        'type' => 'video',
                                        'youtube_url' => 'https://www.youtube.com/watch?v=rr7IRYLqleg',
                                    ],
                                ],
                            ],
                            [
                                'slug' => 'glycogen-metabolism',
                                'title' => 'Glycogen Metabolism',
                                'order_index' => 3,
                                'content' => [
                                    [
                                        'title' => 'Glycogenesis and Glycogenolysis',
                                        'type' => 'text',
                                        'body' => <<<'TXT'
Glycogen is stored in the liver (releases glucose into blood) and skeletal muscle (used locally).

Glycogenesis: glucose → glucose-6-phosphate → glucose-1-phosphate → UDP-glucose → added to glycogen via glycogen synthase.

Glycogenolysis:
- Glycogen phosphorylase cleaves alpha-1,4 bonds → glucose-1-phosphate (rephosphorylated to G-6-P, then glucose in the liver).
- The debranching enzyme fixes the alpha-1,6 branch points.

Hormonal control:
- Glucagon and epinephrine activate glycogen phosphorylase via cAMP/PKA → glycogen breakdown.
- Insulin promotes glycogen synthase → glycogen storage.

Glycogen storage diseases you should know: von Gierke (glucose-6-phosphatase), Pompe (lysosomal acid maltase), McArdle (muscle phosphorylase).
TXT,
                                    ],
                                    [
                                        'title' => 'Glycogenolysis (video)',
                                        'type' => 'video',
                                        'youtube_url' => 'https://www.youtube.com/watch?v=YQV_ODVCzQQ',
                                    ],
                                ],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'molecular-biology',
                        'title' => 'Molecular Biology',
                        'description' => 'DNA replication, transcription, and translation.',
                        'order_index' => 2,
                        'topics' => [
                            [
                                'slug' => 'dna-replication',
                                'title' => 'DNA Replication',
                                'order_index' => 1,
                                'content' => [
                                    [
                                        'title' => 'The Replication Machinery',
                                        'type' => 'text',
                                        'body' => <<<'TXT'
DNA replication is semiconservative and always proceeds 5' → 3'.

Key players:
- Helicase — unwinds the double helix.
- Single-strand binding proteins — keep strands apart.
- Topoisomerase (gyrase in bacteria) — relieves supercoiling.
- Primase — lays down RNA primers.
- DNA polymerase III (prokaryotes) / polymerase delta (eukaryotes) — synthesizes new DNA.
- DNA polymerase I (prokaryotes) — removes RNA primers.
- Ligase — seals nicks between Okazaki fragments.

Leading strand is synthesized continuously; the lagging strand is made as Okazaki fragments.

Clinical correlation: a defect in mismatch repair (MSH2/MLH1) causes Lynch syndrome (hereditary nonpolyposis colorectal cancer).
TXT,
                                    ],
                                ],
                            ],
                            [
                                'slug' => 'transcription',
                                'title' => 'Transcription',
                                'order_index' => 2,
                                'content' => [
                                    [
                                        'title' => 'From Gene to RNA',
                                        'type' => 'text',
                                        'body' => <<<'TXT'
Transcription copies DNA into RNA using RNA polymerase.

- Prokaryotes: one RNA polymerase; polycistronic messages possible.
- Eukaryotes: RNA polymerase II makes mRNA; processing adds a 5' cap, a 3' poly-A tail, and removes introns by splicing.

Regulation:
- Promoters and enhancers recruit transcription factors.
- Epigenetics (histone acetylation, DNA methylation) modulates accessibility of the DNA.

Clinical correlation: antibiotics like rifampin inhibit bacterial RNA polymerase (but not eukaryotic RNA polymerase II) — the basis for treating tuberculosis.
TXT,
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'slug' => 'microbiology',
                'title' => 'Microbiology',
                'description' => 'Bacteria, viruses, fungi, and parasites — classification and disease.',
                'chapters' => [
                    [
                        'slug' => 'bacteriology',
                        'title' => 'Bacteriology',
                        'description' => 'Cell walls, gram staining, and the clinically important bacteria.',
                        'order_index' => 1,
                        'topics' => [
                            [
                                'slug' => 'gram-positive-bacteria',
                                'title' => 'Gram-Positive Bacteria',
                                'order_index' => 1,
                                'content' => [
                                    [
                                        'title' => 'Thick Peptidoglycan, No Outer Membrane',
                                        'type' => 'markdown',
                                        'body' => <<<'TXT'
Gram-positive bacteria stain purple because they retain crystal violet through a **thick peptidoglycan** layer and lack an outer membrane.

## High-yield gram-positives

| Organism | Key features |
| --- | --- |
| Staphylococcus aureus | Coagulase+, MRSA risk, toxic shock syndrome, skin infections |
| Streptococcus pyogenes | Group A, pharyngitis, rheumatic fever, necrotizing fasciitis |
| Streptococcus pneumoniae | Encapsulated, lobar pneumonia, meningitis in adults |
| Enterococcus | Vancomycin-resistant Enterococcus (VRE) |
| Listeria monocytogenes | Intracellular, neonatal meningitis, unpasteurized dairy |
| Clostridium difficile | Toxins A/B, pseudomembranous colitis after antibiotics |
| Bacillus anthracis | Anthrax, protein toxin (edema + lethal factors) |

## Remember

- Catalase test separates Staphylococcus (positive) from Streptococcus (negative).
- Coagulase separates S. aureus (positive) from S. epidermidis/saprophyticus.
- Peptidoglycan synthesis inhibitors (beta-lactams, vancomycin) work especially well here because the wall is thick.
TXT,
                                    ],
                                    [
                                        'title' => 'The Gram Stain (video)',
                                        'type' => 'video',
                                        'youtube_url' => 'https://www.youtube.com/watch?v=MI-FkBDamzw',
                                    ],
                                    [
                                        'title' => 'Staphylococcus: Aureus, Epidermidis, Saprophyticus (video)',
                                        'type' => 'video',
                                        'youtube_url' => 'https://www.youtube.com/watch?v=6BkqWKOG8E0',
                                    ],
                                ],
                            ],
                            [
                                'slug' => 'gram-negative-bacteria',
                                'title' => 'Gram-Negative Bacteria',
                                'order_index' => 2,
                                'content' => [
                                    [
                                        'title' => 'Outer Membrane and LPS',
                                        'type' => 'text',
                                        'body' => <<<'TXT'
Gram-negative bacteria stain pink/red (they lose crystal violet) because their thin peptidoglycan sits between an inner membrane and an outer membrane.

Key structural facts:
- Outer membrane contains lipopolysaccharide (LPS) — the endotoxin. Lipid A is pyrogenic and pro-inflammatory.
- Porins allow small molecules through; drugs must pass this barrier, which drives intrinsic resistance.
- The periplasmic space between the membranes is where many resistance enzymes (e.g., beta-lactamases) live.

High-yield gram-negatives:
- Escherichia coli — UTI, neonatal meningitis, traveler's diarrhea.
- Klebsiella pneumoniae — "currant jelly" sputum, CAP.
- Pseudomonas aeruginosa — nosocomial, wet environments, antipseudomonal drugs needed.
- Neisseria meningitidis — meningitis, petechial rash, DIC.
- Salmonella / Shigella — gastroenteritis.
- Haemophilus influenzae — epiglottitis, meningitis (Hib vaccine).

LPS/Lipid A explains the fevers and septic shock seen in gram-negative bacteremia.
TXT,
                                    ],
                                    [
                                        'title' => 'GRAM POSITIVE VS GRAM NEGATIVE BACTERIA (video)',
                                        'type' => 'video',
                                        'youtube_url' => 'https://www.youtube.com/watch?v=Didrc3wJ3E8',
                                    ],
                                ],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'virology',
                        'title' => 'Virology',
                        'description' => 'Virus structure, replication, and the DNA/RNA virus families.',
                        'order_index' => 2,
                        'topics' => [
                            [
                                'slug' => 'virus-structure',
                                'title' => 'Virus Structure and Replication',
                                'order_index' => 1,
                                'content' => [
                                    [
                                        'title' => 'Capsids, Envelopes, and Genomes',
                                        'type' => 'text',
                                        'body' => <<<'TXT'
Viruses are obligate intracellular parasites made of a nucleic-acid genome packaged in a protein capsid.

Classification by structure:
- Enveloped vs non-enveloped: envelopes come from host membranes and are destroyed by detergents/alcohol; non-enveloped viruses are more stable on surfaces.
- Genome: DNA or RNA, single- or double-stranded, positive- or negative-sense.
- Capsid symmetry: icosahedral or helical.

Replication steps: attachment → entry → uncoating → genome replication and transcription → assembly → release (lysis or budding).

Enveloped viruses with clinical punch: HIV, influenza, hepatitis B/C, HSV, measles, RSV. Non-enveloped: norovirus, rotavirus, poliovirus, HPV, adenovirus.
TXT,
                                    ],
                                    [
                                        'title' => 'Viruses — Khan Academy (video)',
                                        'type' => 'video',
                                        'youtube_url' => 'https://www.youtube.com/watch?v=0h5Jd7sgQWY',
                                    ],
                                ],
                            ],
                            [
                                'slug' => 'herpesviruses',
                                'title' => 'Herpesviruses',
                                'order_index' => 2,
                                'content' => [
                                    [
                                        'title' => 'The Eight Human Herpesviruses',
                                        'type' => 'text',
                                        'body' => <<<'TXT'
All herpesviruses are enveloped, double-stranded DNA viruses that establish latency and can reactivate.

- HSV-1 — orolabial herpes, encephalitis (temporal lobe).
- HSV-2 — genital herpes, neonatal herpes.
- VZV (HHV-3) — chickenpox then shingles; vaccine-preventable.
- EBV (HHV-4) — infectious mononucleosis, hairy leukoplakia, Burkitt lymphoma, nasopharyngeal carcinoma.
- CMV (HHV-5) — congenital infection, retinitis in AIDS, transplant rejection.
- HHV-6 — roseola infantum.
- HHV-7 — roseola.
- HHV-8 — Kaposi sarcoma (KSV).

Latency sites matter: HSV in sensory ganglia (trigeminal/sacral), VZV in dorsal root ganglia, EBV in B cells, CMV in monocyte/macrophage precursors.

Antivirals: acyclovir (HSV/VZV), ganciclovir (CMV). Resistance mechanism: viral thymidine kinase mutation in HSV.
TXT,
                                    ],
                                    [
                                        'title' => 'Why Herpes is Different From Other Viruses (video)',
                                        'type' => 'video',
                                        'youtube_url' => 'https://www.youtube.com/watch?v=FTw6vE-xSwY',
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'slug' => 'pathology',
                'title' => 'Pathology',
                'description' => 'Mechanisms of disease: inflammation, cell injury, and neoplasia.',
                'chapters' => [
                    [
                        'slug' => 'inflammation',
                        'title' => 'Inflammation and Repair',
                        'description' => 'The acute and chronic inflammatory responses.',
                        'order_index' => 1,
                        'topics' => [
                            [
                                'slug' => 'acute-inflammation',
                                'title' => 'Acute Inflammation',
                                'order_index' => 1,
                                'content' => [
                                    [
                                        'title' => 'Vascular and Cellular Events',
                                        'type' => 'markdown',
                                        'body' => <<<'TXT'
Acute inflammation is the immediate, innate response to injury or infection. It lasts minutes to days and is dominated by **neutrophils**.

## Vascular events

1. Transient vasoconstriction, then **vasodilation** (NO, histamine) → redness and warmth.
2. **Increased capillary permeability** (histamine, C3a/C5a, bradykinin) → protein-rich exudate leaks out → swelling (edema).

## Cellular events

1. **Margination** — neutrophils line the endothelium.
2. **Rolling** — selectins slow them down.
3. **Adhesion** — integrins stick them firmly.
4. **Emigration (diapedesis)** — they squeeze between endothelial cells.
5. **Chemotaxis** — C5a, LTB4, and bacterial products guide them to the site.
6. **Phagocytosis** — opsonization (IgG, C3b) → engulfment → killing.

## Cardinal signs

Rubor (redness), tumor (swelling), calor (heat), dolor (pain), functio laesa (loss of function).

Neutrophils arrive in ~6–12 hours; macrophages follow in 1–2 days and dominate chronic inflammation.
TXT,
                                    ],
                                ],
                            ],
                            [
                                'slug' => 'chronic-inflammation',
                                'title' => 'Chronic Inflammation',
                                'order_index' => 2,
                                'content' => [
                                    [
                                        'title' => 'Macrophages, Lymphocytes, and Granulomas',
                                        'type' => 'text',
                                        'body' => <<<'TXT'
Chronic inflammation is longer (weeks to years), driven by lymphocytes, macrophages, and plasma cells, and involves tissue destruction plus attempted repair (fibrosis).

Causes: persistent infection (TB, fungi), autoimmune disease (RA, SLE), prolonged toxic exposure (smoking), and some foreign bodies.

Granulomatous inflammation is a special pattern where macrophages transform into epithelioid cells and multinucleated giant cells, walling off a difficult-to-clear stimulus.

Classic granulomatous diseases:
- Tuberculosis — caseating granulomas (central necrosis).
- Sarcoidosis — non-caseating granulomas.
- Crohn disease, leprosy, fungal infections.

High-yield mnemonic for granulomas: "C3 SNAF" — Coccidioides, Crohn, Chronic granulomatous disease, Sarcoidosis, Syphilis (tertiary), Nocardia, Aspergillus, Fungi/Histoplasma, Mycobacteria (TB/leprosy).
TXT,
                                    ],
                                ],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'neoplasia',
                        'title' => 'Neoplasia',
                        'description' => 'Benign vs malignant tumors, hallmarks of cancer, and spread.',
                        'order_index' => 2,
                        'topics' => [
                            [
                                'slug' => 'benign-vs-malignant',
                                'title' => 'Benign vs Malignant Tumors',
                                'order_index' => 1,
                                'content' => [
                                    [
                                        'title' => 'Differentiation, Invasion, Metastasis',
                                        'type' => 'markdown',
                                        'body' => <<<'TXT'
Neoplasia means "new growth." A neoplasm is benign or malignant.

| Feature | Benign | Malignant |
| --- | --- | --- |
| Differentiation | Well differentiated | Poorly differentiated (anaplasia) |
| Rate of growth | Slow | Rapid, high mitotic rate |
| Local invasion | Expansile, often encapsulated | Infiltrative, destructive |
| Metastasis | Never | Common |

## Nomenclature

- Benign: suffix **-oma** (fibroma, adenoma, lipoma).
- Malignant: **carcinoma** (epithelial origin), **sarcoma** (mesenchymal origin).
- Exception alert: lymphoma, melanoma, and hepatoma are malignant despite "oma."

## Hallmarks of cancer

- Self-sufficiency in growth signals.
- Insensitivity to anti-growth signals.
- Evasion of apoptosis.
- Limitless replicative potential (telomerase).
- Sustained angiogenesis.
- Tissue invasion and metastasis.
- Reprogrammed metabolism (Warburg effect) and immune evasion.

Metastasis routes: lymphatic (e.g., breast → sentinel node), hematogenous (liver/lung predilection), and seeding of body cavities (peritoneal).
TXT,
                                    ],
                                    [
                                        'title' => 'Neoplasia: Benign vs Malignant Tumors (video)',
                                        'type' => 'video',
                                        'youtube_url' => 'https://www.youtube.com/watch?v=s5CnwS6QVC8',
                                    ],
                                ],
                            ],
                            [
                                'slug' => 'cancer-genetics',
                                'title' => 'Molecular Basis of Cancer',
                                'order_index' => 2,
                                'content' => [
                                    [
                                        'title' => 'Oncogenes and Tumor Suppressor Genes',
                                        'type' => 'text',
                                        'body' => <<<'TXT'
Cancer arises from accumulated genetic damage — the "multi-hit" model.

Oncogenes (the accelerator): gain-of-function mutations turn proto-oncogenes into oncogenes. One hit is often enough because they act dominantly.
- RAS (GTPase) — colon, pancreas, lung.
- MYC (transcription factor) — Burkitt lymphoma.
- HER2/neu (growth factor receptor) — breast cancer.
- BCR-ABL (fusion kinase) — CML (targeted by imatinib).

Tumor suppressor genes (the brakes): loss-of-function requires both alleles (Knudson's two-hit hypothesis).
- RB — retinoblastoma.
- TP53 — the "guardian of the genome," mutated in most cancers.
- APC — familial adenomatous polyposis → colon cancer.
- BRCA1/BRCA2 — breast and ovarian cancer (DNA repair).

Carcinogens: chemicals (aflatoxin, tobacco), radiation (UV → pyrimidine dimers in skin), and oncogenic viruses (HPV, HBV, EBV, HTLV-1).
TXT,
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }
}
