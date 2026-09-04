import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from '@/services/api'

const collaborateSchema = z.object({
  name: z.string().min(2, 'Please share a name.'),
  organization: z.string().min(2, 'Please share an organization.'),
  email: z.string().email('Please enter a valid email.'),
  message: z.string().min(20, 'Please add a little more detail.'),
})

type CollaborateFormValues = z.infer<typeof collaborateSchema>

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

export function Collaborate() {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CollaborateFormValues>({
    resolver: zodResolver(collaborateSchema),
    defaultValues: {
      name: '',
      organization: '',
      email: '',
      message: '',
    },
  })

  const onSubmit = async (data: CollaborateFormValues) => {
    try {
      setError(null)
      await api.submitCollaborateForm(data)
      setSubmitted(true)
      reset()
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit form. Please try again.'
      setError(errorMessage)
    }
  }

  return (
    <section id="collaborate" className="px-6 py-20 sm:px-8 lg:px-10 lg:py-28 xl:px-14">
      <div className="mx-auto grid max-w-shell gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          className="max-w-2xl"
        >
          <p className="text-xs font-medium uppercase tracking-[0.34em] text-brand-deep/55">
            Collaborate
          </p>
          <h2 className="mt-4 font-display text-4xl leading-[0.95] tracking-[-0.03em] text-brand-deep sm:text-5xl lg:text-6xl">
            Bring Heartstrings to your space
          </h2>
          <p className="mt-6 text-lg leading-8 text-brand-deep/78 sm:text-xl">
            Hospitals, clinics, and event organizers can invite our ensembles to
            share intimate performances designed around the setting and the
            people in it.
          </p>

          <div className="mt-10 space-y-4 rounded-[2rem] border border-brand-rose/40 bg-[linear-gradient(180deg,rgba(255,255,255,0.8)_0%,rgba(255,248,244,0.94)_100%)] p-6 shadow-[0_24px_70px_rgba(201,116,143,0.1)] sm:p-8">
            <p className="font-display text-3xl italic text-brand-deep sm:text-4xl">
              For patients, families, caregivers, and staff.
            </p>
            <p className="text-sm leading-7 text-brand-deep/72 sm:text-base">
              We coordinate repertoire and ensemble size carefully so every
              visit feels respectful, present, and music-first.
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
              <FormField label="Name" htmlFor="collaborate-name" error={errors.name?.message}>
                <input
                  id="collaborate-name"
                  type="text"
                  className={inputClassName}
                  placeholder="Your name"
                  {...register('name')}
                />
              </FormField>

              <FormField
                label="Organization"
                htmlFor="collaborate-organization"
                error={errors.organization?.message}
              >
                <input
                  id="collaborate-organization"
                  type="text"
                  className={inputClassName}
                  placeholder="Hospital, clinic, or venue"
                  {...register('organization')}
                />
              </FormField>
            </div>

            <FormField label="Email" htmlFor="collaborate-email" error={errors.email?.message}>
              <input
                id="collaborate-email"
                type="email"
                className={inputClassName}
                placeholder="name@organization.org"
                {...register('email')}
              />
            </FormField>

            <FormField label="Message" htmlFor="collaborate-message" error={errors.message?.message}>
              <textarea
                id="collaborate-message"
                rows={6}
                className={`${inputClassName} resize-none`}
                placeholder="Tell us about the space, timing, and what you hope the visit might offer."
                {...register('message')}
              />
            </FormField>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-full border border-brand-rose/70 bg-white/55 px-7 py-3.5 text-sm font-medium tracking-[0.18em] text-brand-deep transition duration-300 ease-out enabled:hover:-translate-y-1 enabled:hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-70"
              >
                Send inquiry
              </button>

              <p className="text-sm leading-6 text-brand-deep/62 sm:max-w-sm sm:text-right">
                We&apos;ll review your request and get back to you as soon as possible.
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
                  Thank you for reaching out! We&apos;ll be in touch soon.
                </motion.p>
              ) : null}
            </AnimatePresence>
          </form>
        </motion.div>
      </div>
    </section>
  )
}