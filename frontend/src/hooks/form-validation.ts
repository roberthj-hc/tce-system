type ValidationFields = {
  name: string
  lastName: string
  email: string
  phone: string
  address: string
  password: string
  confirmPassword: string
  role: string
  code: string
}

type ValidationResult = {
  passwordsMatch: boolean
  allFieldsFilled: boolean
  matchFeedbackColor: string
}

export function useFormValidation(fields: ValidationFields): ValidationResult {
  const {
    name,
    lastName,
    email,
    phone,
    address,
    password,
    confirmPassword,
    role,
    code
  } = fields

  const passwordsMatch = password !== "" && confirmPassword !== "" && password === confirmPassword
  const isAdmin = role === "1"

  const allFieldsFilled: boolean =
    Boolean(name) &&
    Boolean(lastName) &&
    Boolean(email) &&
    Boolean(phone) &&
    Boolean(address) &&
    Boolean(password) &&
    Boolean(confirmPassword) &&
    Boolean(role) &&
    passwordsMatch &&
    (!isAdmin || Boolean(code))

  const matchFeedbackColor = !confirmPassword
    ? "text-muted-foreground"
    : passwordsMatch
    ? "text-green-600"
    : "text-yellow-600"

  return {
    passwordsMatch,
    allFieldsFilled,
    matchFeedbackColor
  }
}
