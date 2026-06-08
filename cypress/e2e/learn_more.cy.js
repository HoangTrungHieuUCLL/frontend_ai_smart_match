describe('Job listing Learn more navigation (uses backend)', () => {
  it('clicking Learn more navigates to job description page using backend data', () => {
    // Visit the job search page and rely on the real backend to provide jobs
    cy.visit('/job-search-with-ai');

    // Wait for the page to load jobs and render at least one "Learn more" button
    cy.contains('button', 'Learn more', { timeout: 10000 }).should('be.visible');

    // Click the first Learn more button and assert we navigated to a job-info route
    cy.contains('button', 'Learn more').first().click();

    cy.location('pathname', { timeout: 10000 }).should('match', /\/job-info\/\d+$/);
  });
});
