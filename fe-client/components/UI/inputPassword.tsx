'use client'

import React, { useState, useEffect } from 'react'

/* ===========================
   ICONS
=========================== */

const EyeIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const EyeOffIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </svg>
)

const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const XIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

/* ===========================
   VALIDATION RULES
=========================== */

const validationRules = [
  { id: 'length', text: 'At least 8 characters', regex: /.{8,}/ },
  { id: 'number', text: 'At least 1 number', regex: /\d/ },
  { id: 'lowercase', text: 'At least 1 lowercase letter', regex: /[a-z]/ },
  { id: 'uppercase', text: 'At least 1 uppercase letter', regex: /[A-Z]/ },
  { id: 'special', text: 'At least 1 special character', regex: /[^A-Za-z0-9]/ },
] as const

type ValidationKey = (typeof validationRules)[number]['id']

/* ===========================
   VALIDATION ITEM
=========================== */

const ValidationItem = ({
  isValid,
  text,
}: {
  isValid: boolean
  text: string
}) => (
  <li
    className={`flex items-center text-sm transition-colors duration-300 ${
      isValid
        ? 'text-green-600 dark:text-green-400'
        : 'text-muted-foreground'
    }`}
  >
    {isValid ? (
      <CheckIcon className="h-4 w-4 mr-2" />
    ) : (
      <XIcon className="h-4 w-4 mr-2" />
    )}
    {text}
  </li>
)

/* ===========================
   MAIN COMPONENT
=========================== */

interface StrongPasswordInputProps {
  label: string
  name: string
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  showValidation?: boolean
  disabled?: boolean
}

const InputPassword = ({
  label,
  name,
  placeholder = 'Enter your password',
  value,
  onChange,
  showValidation = true,
  disabled = false,
}: StrongPasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false)
  const [internalPassword, setInternalPassword] = useState('')
  const [validationState, setValidationState] = useState<
    Record<ValidationKey, boolean>
  >({
    length: false,
    number: false,
    lowercase: false,
    uppercase: false,
    special: false,
  })

  const password = value ?? internalPassword
  const isPristine = password === ''

  useEffect(() => {
    if (!showValidation) return

    const newState = {} as Record<ValidationKey, boolean>

    validationRules.forEach((rule) => {
      newState[rule.id] = rule.regex.test(password)
    })

    setValidationState(newState)
  }, [password, showValidation])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange ? onChange(newValue) : setInternalPassword(newValue)
  }

  return (
    <div className="w-full space-y-4">
      {/* INPUT */}
      <div className="space-y-2">
        <label className="text-sm font-medium">{label}</label>

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name={name}
            value={password}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm pr-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            disabled={disabled}
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
            {showPassword ? (
              <EyeOffIcon className="h-4 w-4" />
            ) : (
              <EyeIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* VALIDATION (có điều kiện) */}
      {showValidation && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">
              Password requirements
            </h3>
            {isPristine && (
              <span className="text-xs text-muted-foreground">
                Enter a password to check
              </span>
            )}
          </div>

          <ul className="space-y-2">
            {validationRules.map((rule) => (
              <ValidationItem
                key={rule.id}
                isValid={validationState[rule.id]}
                text={rule.text}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default InputPassword