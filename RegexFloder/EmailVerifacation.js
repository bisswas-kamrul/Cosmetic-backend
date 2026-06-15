function EmailVerifacation (email) {
    const Emailregex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
  return Emailregex.test(email); //  Email Address right ase  kina ta justifay korrar jonno
}
module.exports = EmailVerifacation