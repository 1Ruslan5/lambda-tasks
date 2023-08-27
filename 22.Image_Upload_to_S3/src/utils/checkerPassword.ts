export const checkerPassword = (password) => {
    return String(password)
      .match(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
      );
}