'use client'

import { motion } from 'framer-motion'
import { usePrefersReducedMotion as useReducedMotion } from '@/lib/hooks/use-prefers-reduced-motion'

import { CostScenario } from '@/components/marketing/cost-scenario'
import { SiteHeader } from '@/components/marketing/site-header'
import { EstimateCalculator } from '@/components/workspace/estimate-calculator'
import { ArrowUpRight, CheckCircle2, FileText, Clock3 } from 'lucide-react'
import Image from 'next/image'

const EASE = [0.22, 1, 0.36, 1] as const

const stages = [
  {
    number: '01',
    eyebrow: 'COST ESTIMATE',
    title: 'Know the number before the visit.',
    text: 'Give patients a plain-language estimate of what they will owe; before they sit in the chair. Try a planning estimate with your own allowed amount, deductible, and coinsurance.',
    note: 'AT SCHEDULING',
  },
  {
    number: '02',
    eyebrow: 'PRIOR AUTH ASSIST',
    title: 'Move approvals forward.',
    text: 'Give each request a clear next step. Track authorization tasks in your worklist and explore how documentation becomes a draft in the sample workflow.',
    note: 'FROM CLINICAL NOTE',
  },
  {
    number: '03',
    eyebrow: 'APPEAL ASSIST',
    title: 'Make denials easier to fight.',
    text: 'Keep appeal follow-ups and deadlines in view. Explore a sample letter in the demo, then organize your own next steps in the workspace.',
    note: 'WHEN A CLAIM IS DENIED',
  },
]

const practiceItems = [
  {
    number: '01',
    title: 'A simple place to start.',
    text: 'Create tasks and calculate planning estimates right in your browser.',
  },
  {
    number: '02',
    title: 'A next step for every task.',
    text: 'Keep estimates, authorization follow-ups, and appeals on one worklist.',
  },
  {
    number: '03',
    title: 'Your work, in your hands.',
    text: 'Review your inputs, update task status, and export your work whenever you need it.',
  },
]

function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: reduceMotion ? 0 : 0.6, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

export default function Page() {

  return (
    <>
      <main className="poros-site">
      <SiteHeader />
      <section className="hero" id="top">
        <Image src="/images/clinic-hero.webp" alt="A clinician welcoming a patient in a sunlit neighborhood practice" fill preload sizes="100vw" className="hero-photo" />
        <div className="hero-shade" />
        <div className="hero-copy">
          <p className="eyebrow">MORE ROOM FOR PATIENTS</p>
          <h1>Make care<br />move <em>forward.</em></h1>
          <p className="lede">Less administrative work. More time for care. A clearer revenue cycle for your independent practice.</p>
          <div className="hero-actions"><a className="button button-dark" href="/workspace">Open your workspace <ArrowUpRight size={17} /></a><a className="button button-outline" href="/demo">Explore the demo</a></div>
        </div>
      </section>
      <div className="journey-strip"><span>One connected journey</span><a href="/demo/estimate">01 <b>Estimate</b><ArrowUpRight size={16} /></a><a href="/demo/prior-auth">02 <b>Authorize</b><ArrowUpRight size={16} /></a><a href="/demo/appeal">03 <b>Appeal</b><ArrowUpRight size={16} /></a></div>

      <section className="intro section-grid" id="problem">
        <Reveal><h2>Care is personal.<br /><em>Admin should be simpler.</em></h2></Reveal>
        <Reveal className="intro-text"><p>Between scheduling a visit and getting paid, there is a lot to keep track of. Your front desk should not have to piece it together alone.</p><p>Poros brings estimates, authorization tasks, and appeals into one understandable workflow. Start with a practical worklist, then explore the patient journey in our interactive demo.</p><a className="text-link" href="/workspace">Make space for your next step <ArrowUpRight size={15} /></a></Reveal>
        <Reveal className="scenario-section"><CostScenario /></Reveal>
      </section>

      <section className="platform" id="platform">
        <Reveal className="platform-header"><div><p className="eyebrow">THE POROS PLATFORM</p><h2>Three friction points.<br /><em>One flow.</em></h2></div><p>Follow one sample patient from scheduling to appeal in the demo. Organize your own tasks in a separate, persistent workspace.</p></Reveal>
        <div id="process">
          {stages.map((stage) => (
            <Reveal key={stage.number} className="zigzag-row">
              <div className="zigzag-content stage-content">
                <div className="stage-kicker"><span>{stage.number}</span><p className="eyebrow" style={{ margin: 0 }}>{stage.eyebrow}</p></div>
                <h3>{stage.title}</h3>
                <p>{stage.text}</p>
                <p className="stage-note">{stage.note} <span>↘</span></p>
              </div>
              <div className="platform-visual">
                {stage.number === '01' ? <EstimateCalculator compact /> : stage.number === '02' ? <div className="workflow-visual"><div className="tool-heading"><span>A clear path to review</span><Clock3 size={18} /></div><h3>Keep the next<br />step in sight.</h3>{['Gather visit documentation', 'Prepare the request', 'Review with your team'].map((text, index) => <a href="/demo/prior-auth" key={text}><span>{index === 0 ? <CheckCircle2 size={20} /> : `0${index + 1}`}</span><div><b>{text}</b><small>{['Bring the context together', 'Build a reviewable draft', 'Decide what happens next'][index]}</small></div><ArrowUpRight size={16} /></a>)}<p className="tool-note">Explore the sample authorization workflow.</p></div> : <div className="appeal-visual"><FileText size={28} /><p>THE APPEAL WORKSPACE</p><h3>From a denial<br />to a next step.</h3><div className="appeal-detail"><CheckCircle2 size={18} /><span>Reason for denial</span></div><div className="appeal-detail"><CheckCircle2 size={18} /><span>Supporting documentation</span></div><div className="appeal-detail"><Clock3 size={18} /><span>Deadline to follow up</span></div><a href="/demo/appeal" className="text-link">Explore a sample appeal <ArrowUpRight size={15} /></a></div>}
              </div>
            </Reveal>
          ))}
        </div>
        <a className="text-link platform-demo-link" href="/demo">WALK THROUGH THE LIVE DEMO <span>↗</span></a>
      </section>

      <section className="practice" id="practice">
        <Reveal className="section-grid"><div><p className="eyebrow">BUILT FOR YOUR PRACTICE</p><h2>Big-system leverage.<br /><em>Small-practice ease.</em></h2></div><div /></Reveal>
        <div className="practice-layout"><div className="practice-photo"><Image src="/images/practice-team.webp" alt="A clinician and practice manager reviewing their work together" width={1200} height={800} sizes="(max-width: 800px) 100vw, 50vw" /></div><div className="practice-benefits">{practiceItems.map(item => <Reveal key={item.number}><span>{item.number}</span><div><h3>{item.title}</h3><p>{item.text}</p></div></Reveal>)}<a href="/workspace" className="button button-outline">Start with your worklist <ArrowUpRight size={16} /></a></div></div>
      </section>

      <section className="final-cta" id="contact"><p className="eyebrow">A BETTER WAY TO KEEP CARE MOVING</p><h2>Your front desk<br /><em>deserves Poros.</em></h2><a className="button button-dark" href="/workspace">OPEN YOUR WORKSPACE ↗</a></section>
      <footer><span>© 2026 POROS</span><span>REVENUE-CYCLE AI FOR THE PRACTICES THAT POWER CARE</span><a href="#top">BACK TO TOP ↑</a></footer>
    </main>
    </>
  )
}
