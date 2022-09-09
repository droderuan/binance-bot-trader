class AppError {
  readonly from: string
  readonly message: string

  constructor(from = "GENERIC", message: string) {
    this.from = from
    this.message = message
  }
}

export default AppError