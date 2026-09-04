import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from '@/services/api'

const joinSchema = z.object({
  name: z.string().min(2, 'Please share a name.'),
  email: z.string().email('Please enter a valid email.'),
  instrument: z.string().min(2, 'Please share your instrument.'),
  experienceLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']),
})

type JoinFormValues = z.infer<typeof joinSchema>

function FormField({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  children: ReactNode
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="text-sm font-medium tracking-[0.14em] text-brand-deep/72">
        {label}
      </span>
      {children}
      <AnimatePresence>
        {error ? (
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-2 block text-sm text-[#a45574]"
            role="alert"
          >
            {error}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </label>
  )
}

const inputClassName =
  'mt-2 w-full rounded-2xl border border-brand-rose/55 bg-white/80 px-4 py-3 text-brand-deep outline-none transition focus:border-brand-deep focus:ring-4 focus:ring-brand-pink/40'

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: 'easeOut' },
  },
}

export function Join() {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<JoinFormValues>({
    resolver: zodResolver(joinSchema),
    defaultValues: {
      name: '',
      email: '',
      instrument: '',
      experienceLevel: 'Intermediate',
    },
  })

  const onSubmit = async (data: JoinFormValues) => {
    try {
      setError(null)
      await api.submitJoinForm(data)
      setSubmitted(true)
      reset({
        name: '',
        email: '',
        instrument: '',
        experienceLevel: 'Intermediate',
      })
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit form. Please try again.'
      setError(errorMessage)
    }
  }

  return (
    <section id="join" className="px-6 py-20 sm:px-8 lg:px-10 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          className="max-w-2xl"
        >
          <p className="text-xs font-medium uppercase tracking-[0.34em] text-brand-deep/55">
            Join
          </p>
          <h2 className="mt-4 font-display text-4xl leading-[0.95] tracking-[-0.03em] text-brand-deep sm:text-5xl lg:text-6xl">
            Make music that matters
          </h2>
          <p className="mt-6 text-lg leading-8 text-brand-deep/78 sm:text-xl">
            Students who want to share chamber music in hospitals and clinics
            are welcome to request membership. We look for care, consistency,
            and musical sensitivity above all else.
          </p>

          <div className="mt-10 rounded-[2rem] border border-brand-rose/40 bg-[linear-gradient(180deg,rgba(255,255,255,0.82)_0%,rgba(255,248,244,0.94)_100%)] p-6 shadow-[0_24px_70px_rgba(201,116,143,0.1)] sm:p-8">
            <p className="font-display text-3xl italic text-brand-deep sm:text-4xl">
              Rehearse thoughtfully. Perform gently. Show up for people.
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="rounded-[2.5rem] border border-brand-rose/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.84)_0%,rgba(255,248,244,0.96)_100%)] p-6 shadow-[0_28px_90px_rgba(201,116,143,0.12)] sm:p-8"
        >
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Name" htmlFor="join-name" error={errors.name?.message}>
                <input
                  id="join-name"
                  type="text"
                  className={inputClassName}
                  placeholder="Your name"
                  {...register('name')}
                />
              </FormField>

              <FormField label="Email" htmlFor="join-email" error={errors.email?.message}>
                <input
                  id="join-email"
                  type="email"
                  className={inputClassName}
                  placeholder="you@school.edu"
                  {...register('email')}
                />
              </FormField>
            </div>

            <FormField label="Instrument" htmlFor="join-instrument" error={errors.instrument?.message}>
              <input
                id="join-instrument"
                type="text"
                className={inputClassName}
                placeholder="Violin, flute, cello, horn..."
                {...register('instrument')}
              />
            </FormField>

            <FormField
              label="Experience Level"
              htmlFor="join-experience-level"
              error={errors.experienceLevel?.message}
            >
              <select id="join-experience-level" className={inputClassName} {...register('experienceLevel')}>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </FormField>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-full border border-brand-rose/70 bg-white/55 px-7 py-3.5 text-sm font-medium tracking-[0.18em] text-brand-deep transition duration-300 ease-out enabled:hover:-translate-y-1 enabled:hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-70"
              >
                Request membership
              </button>

              <p className="text-sm leading-6 text-brand-deep/62 sm:max-w-sm sm:text-right">
                Expectation is simple: be prepared, be kind, and care about the
                people in the room.
              </p>
            </div>

            <AnimatePresence>
              {error ? (
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  className="rounded-[1.5rem] border border-red-300 bg-red-50 px-4 py-3 text-sm leading-7 text-red-700"
                  role="alert"
                >
                  {error}
                </motion.p>
              ) : null}
            </AnimatePresence>

            <AnimatePresence>
              {submitted ? (
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  className="rounded-[1.5rem] border border-brand-rose/45 bg-brand-pink/55 px-4 py-3 text-sm leading-7 text-brand-deep"
                  role="status"
                >
                  We&apos;d love to have you! Keep an eye on your inbox.
                </motion.p>
              ) : null}
            </AnimatePresence>
          </form>
        </motion.div>
      </div>
    </section>
  )
}