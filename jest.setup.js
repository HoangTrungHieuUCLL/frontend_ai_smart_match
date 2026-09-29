import "@testing-library/jest-dom";

// Tests assert English copy; I18nProvider defaults to VN.
beforeEach(() => {
    sessionStorage.setItem("language", "EN");
});
