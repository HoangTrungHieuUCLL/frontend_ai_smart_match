const API_URL = Cypress.env("apiUrl") || "http://localhost:8000";

const jobsResponse = [
    {
        id: 1,
        company_name: "Acme Labs",
        position: "Backend Engineer",
        date: "2026-06-09",
        location: "Brussels",
        type: "Full-time",
        overview: "Build backend systems.",
        responsibilities: "Create APIs.",
        requirements: "Python, SQL",
        offers: "Remote work",
        salary: "5000",
        notes: "",
        requirements_simplified: "Python, SQL",
        compatibility_score: null,
    },
    {
        id: 2,
        company_name: "Pixel Works",
        position: "Frontend Engineer",
        date: "2026-06-09",
        location: "Ghent",
        type: "Full-time",
        overview: "Build frontend systems.",
        responsibilities: "Create UI.",
        requirements: "React, TypeScript",
        offers: "Hybrid work",
        salary: "4800",
        notes: "",
        requirements_simplified: "React, TypeScript",
        compatibility_score: null,
    },
];

const uploadResponse = {
    message: "CV uploaded successfully",
    cv_id: 100,
    profile_id: 200,
    cv_file_name: "guest-cv.pdf",
    ai_result: {
        candidate_profile: {
            given_name: "Guest",
            middle_name: "",
            family_name: "Candidate",
            current_title: "Frontend Engineer",
            phone: "123456789",
            location: "Brussels",
            email: "guest@example.com",
            bio: "Builds accessible React applications.",
            skills: ["React", "TypeScript", "Testing"],
        },
        work_experience: [
            {
                job_title: "Frontend Developer",
                company_name: "Demo Company",
                start_date: "2024",
                end_date: "2026",
            },
        ],
        education: [],
        projects: [],
        languages: [],
        certifications: [],
    },
};

const scoredJobsResponse = {
    profile_id: 200,
    saved_count: 2,
    jobs: [
        {
            job_id: 1,
            company_name: "Acme Labs",
            position: "Backend Engineer",
            location: "Brussels",
            type: "Full-time",
            requirements: "Python, SQL",
            requirements_simplified: "Python, SQL",
            compatibility_score: 45,
        },
        {
            job_id: 2,
            company_name: "Pixel Works",
            position: "Frontend Engineer",
            location: "Ghent",
            type: "Full-time",
            requirements: "React, TypeScript",
            requirements_simplified: "React, TypeScript",
            compatibility_score: 92,
        },
    ],
};

describe("Guest CV upload and scoring", () => {
    beforeEach(() => {
        cy.clearLocalStorage();
        cy.clearAllSessionStorage();
        cy.intercept("GET", `${API_URL}/jobs`, jobsResponse).as("jobs");
    });

    it("uploads a guest CV, reviews extracted data, edits a field, and sorts jobs by score", () => {
        cy.intercept("POST", `${API_URL}/cv/upload`, {
            delay: 300,
            body: uploadResponse,
        }).as("uploadCv");
        cy.intercept("PUT", `${API_URL}/cv/200/extracted-data`, {
            statusCode: 200,
            body: { ok: true },
        }).as("updateCv");
        cy.intercept("GET", `${API_URL}/profiles/200/all`, scoredJobsResponse).as("scoreJobs");

        cy.visit("/job-search-with-ai");
        cy.wait("@jobs");

        cy.contains("button", "Upload your CV").click();
        cy.contains("Upload your CV").should("be.visible");

        fillCvIdentityForm();
        cy.contains("button", "Continue").click();

        cy.contains("Upload your PDF").should("be.visible");
        selectFile("guest-cv.pdf", "application/pdf", "%PDF-1.4 guest cv");
        cy.contains("File selected: guest-cv.pdf").should("be.visible");
        cy.contains("button", "Upload CV").click();

        cy.contains("Sending your CV to our server").should("be.visible");
        cy.wait("@uploadCv");

        cy.contains("CV Summary").should("be.visible");
        cy.get('input[value="Guest"]').should("be.visible");
        cy.get('input[value="Candidate"]').should("be.visible");
        cy.get('input[value="Frontend Engineer"]').should("be.visible");
        cy.contains("Builds accessible React applications.").should("be.visible");
        cy.contains("React").should("be.visible");

        cy.contains("button", "Edit").click();
        cy.get('input[value="Guest"]')
            .scrollIntoView()
            .clear({ force: true })
            .type("Casey", { force: true });
        cy.contains("button", "Save changes").click();

        cy.wait("@updateCv").its("request.body.candidate_profile.given_name").should("eq", "Casey");
        cy.wait("@scoreJobs");

        cy.contains("CV Summary").should("not.exist");
        cy.contains("92%").should("be.visible");
        cy.contains("45%").should("be.visible");

        cy.contains("Frontend Engineer").then(($higherScoreJob) => {
            cy.contains("Backend Engineer").then(($lowerScoreJob) => {
                expect($higherScoreJob.offset()?.top ?? 0).to.be.lessThan($lowerScoreJob.offset()?.top ?? 0);
            });
        });
    });

    it("shows an error for a non-PDF upload and does not proceed to review", () => {
        cy.visit("/job-search-with-ai");
        cy.wait("@jobs");

        cy.contains("button", "Upload your CV").click();
        fillCvIdentityForm();
        cy.contains("button", "Continue").click();

        selectFile("guest-cv.txt", "text/plain", "not a pdf");

        cy.contains("Only PDF files are allowed").should("be.visible");
        cy.contains("CV Summary").should("not.exist");
    });
});

function fillCvIdentityForm() {
    cy.get('input[placeholder="Enter your family name"]').type("Candidate");
    cy.get('input[placeholder="Enter your middle name"]').type("Q");
    cy.get('input[placeholder="Enter your given name"]').type("Guest");
    cy.get('input[placeholder="Enter your email"]').type("guest@example.com");
}

function selectFile(fileName: string, mimeType: string, contents: string) {
    cy.get('input[type="file"]').selectFile(
        {
            contents: Cypress.Buffer.from(contents),
            fileName,
            mimeType,
            lastModified: Date.now(),
        },
        { force: true },
    );
}
