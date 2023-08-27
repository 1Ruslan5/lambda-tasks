export const checkerName = (name) => {
    return String(name)
      .match(
        /^[a-z]{3,}$/
      );
}