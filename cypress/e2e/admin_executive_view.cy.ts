const API_URL = Cypress.env("apiUrl") || "http://localhost:8000";

const fakeToken = (role: "admin" | "user", subject: string) =>
    `${btoa(JSON.stringify({
        exp: Math.floor(Date.now() / 1000) + 3600,
        role,
        sub: subject,
    }))}.test-signature`;

const dashboardResponse = {
    total_jobs: 3,
    total_cvs: 2,
    top_skills: [
        {skill: "Python", count: 2},
        {skill: "FastAPI", count: 1},
    ],
    cvs: [
        {
            id: 101,
            filename: "alex_morgan_cv.pdf",
            uploaded_at: "2026-06-09T10:00:00",
            candidate_profile: {
                id: 201,
                cv_id: 101,
                given_name: "Alex",
                middle_name: null,
                family_name: "Morgan",
                current_title: "Backend Engineer",
                skills: "Python, FastAPI",
                phone: "123456789",
                location: "Brussels",
                email: "alex@example.com",
                bio: "Builds API systems.",
                work_experiences: [],
                educations: [],
                projects: [],
                languages: [],
                certifications: [],
                compatibility_scores: [],
            },
            compatibility_scores: [],
        },
    ],
    cv_table: {
        total_count: 1,
        page: 1,
        page_size: 20,
        total_pages: 1,
    },
};

const jobsResponse = [
    {
        id: 1,
        company_name: "Smart Match",
        position: "Backend Engineer",
        date: "2026-06-09",
        location: "Brussels",
        type: "Full-time",
        overview: "Build matching services.",
        responsibilities: "Create APIs.",
        requirements: "Python and FastAPI",
        offers: "Flexible work",
        salary: "5000",
        notes: "",
        requirements_simplified: "Python, FastAPI",
        compatibility_score: null,
    },
];

describe("Admin login and executive view", () => {
    beforeEach(() => {
        cy.clearLocalStorage();
    });

    it("redirects an authenticated admin from login to the executive view", () => {
        cy.intercept("POST", `${API_URL}/auth/login`, (req) => {
            expect(req.body).to.deep.equal({
                email: "admin",
                password: "admin",
            });

            req.reply({
                access_token: fakeToken("admin", "admin"),
                token_type: "bearer",
                email: "admin",
            });
        }).as("adminLogin");
        cy.intercept("GET", `${API_URL}/executive-view*`, dashboardResponse).as("dashboard");
        cy.intercept("GET", `${API_URL}/jobs`, jobsResponse).as("jobs");

        cy.visit("/login");
        cy.get('input[placeholder="email"]').type("admin");
        cy.get('input[placeholder="password"]').type("admin");
        cy.contains("button", "Log in").click();

        cy.wait("@adminLogin");
        cy.location("pathname", {timeout: 10000}).should("eq", "/executive-view");
    });

    it("renders KPI cards with non-negative values", () => {
        visitExecutiveViewAsAdmin();

        cy.get('[data-testid="kpi-card"]').its("length").should("be.gte", 2);
        cy.get('[data-testid="kpi-card"]').each(($card) => {
            const values = Array.from(
                $card.text().matchAll(/\d[\d,]*/g),
                (match) => match[0],
            );
            expect(values.length).to.be.greaterThan(0);
            values.forEach((value) => {
                expect(Number(value.replace(/,/g, ""))).to.be.at.least(0);
            });
        });
    });

    it("renders at least one top skill bar when CV data contains skills", () => {
        visitExecutiveViewAsAdmin();

        cy.contains("Top 15 Skills").should("be.visible");
        cy.get('[data-testid="skill-bar"]').its("length").should("be.gte", 1);
        cy.contains("Python").should("be.visible");
    });

    it("renders CV rows and opens the detail modal when a row is clicked", () => {
        visitExecutiveViewAsAdmin();

        cy.get('[data-testid="cv-table-row"]').its("length").should("be.gte", 1);
        cy.contains('[data-testid="cv-table-row"]', "alex_morgan_cv.pdf").click();
        cy.contains("CV Summary").should("be.visible");
        cy.get('input[value="Alex"]').should("be.visible");
        cy.get('input[value="Morgan"]').should("be.visible");
    });

    it("blocks a regular user token from admin-protected executive API data", () => {
        const email = `regular-user-${Date.now()}@example.com`;

        cy.request({
            method: "POST",
            url: `${API_URL}/auth/register`,
            body: {
                email,
                password: "Password1",
            },
        }).then(({body}) => {
            cy.request({
                method: "GET",
                url: `${API_URL}/executive-view`,
                headers: {
                    Authorization: `Bearer ${body.access_token}`,
                },
                failOnStatusCode: false,
            }).its("status").should("eq", 403);
        });
    });

    it("redirects unauthenticated executive view requests to login", () => {
        cy.intercept("GET", `${API_URL}/jobs`, jobsResponse);

        cy.visit("/executive-view");

        cy.location("pathname", {timeout: 10000}).should("eq", "/login");
    });
});

function visitExecutiveViewAsAdmin() {
    cy.intercept("GET", `${API_URL}/executive-view*`, dashboardResponse).as("dashboard");
    cy.intercept("GET", `${API_URL}/jobs`, jobsResponse).as("jobs");

    cy.visit("/executive-view", {
        onBeforeLoad(win) {
            win.localStorage.setItem("access_token", fakeToken("admin", "admin"));
            win.localStorage.setItem("email", "admin");
        },
    });

    cy.wait("@dashboard");
    cy.contains("Executive View").should("be.visible");
}
