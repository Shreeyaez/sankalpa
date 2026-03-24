--- These are the scripts for creating projects, accounts, and role assignments in the Sankalpa system.
--- Only use this for emergency data seeding. For regular operations, use the application interface to ensure proper validation and error handling.
--- @shreeya

/* =========================================================
   PROJECT INSERTION
   Purpose: Insert a new infrastructure project into projects table
   ========================================================= */

INSERT INTO PROJECTS (
    PROJECT_CODE,                 -- Unique identifier for the project
    PROJECT_NAME,                 -- Name/title of the project
    WARD_NO,                      -- Ward number where project is located
    MUNICIPALITY,                 -- Municipality name
    DISTRICT,                     -- District name
    PROVINCE,                     -- Province name
    TOTAL_APPROVED_BUDGET,        -- Total allocated budget
    PLANNED_START_DATE,           -- Planned project start date
    PLANNED_COMPLETION_DATE,      -- Planned project end date
    PLANNED_DURATION_DAYS,        -- Estimated duration in days
    ASSIGNED_ENGINEER_ID,         -- Linked engineer (FK, nullable)
    BUDGET_SOURCE_ID,             -- Budget source reference (FK)
    CHAIRPERSON_ID,               -- Chairperson overseeing (FK, nullable)
    CONTRACTOR_ID,                -- Contractor assigned (FK)
    FISCAL_YEAR_ID,               -- Fiscal year reference (FK)
    LOCATION,                     -- General location description
    PRIORITY,                     -- Priority level (HIGH/MEDIUM/LOW)
    STATUS,                       -- Current project status
    PROJECT_DESCRIPTION,          -- Detailed description
    CONTRACTOR_CONTACT_PERSON,    -- Contractor contact info
    CREATED_AT                    -- Record creation timestamp
) VALUES (
    'PUR-2026-03',
    'Purna Road Construction',
    1,
    'Kathmandu',
    'Kathmandu',
    'Bagmati',
    50000000,
    '2026-03-01',
    '2026-06-01',
    92,
    NULL,                         -- Engineer not yet assigned
    1,
    NULL,                         -- Chairperson not yet assigned
    1,
    1,
    'Kathmandu',
    'HIGH',
    'ONGOING',
    'Project for construction of Purna Road.',
    '',
    NOW()
);

/* =========================================================
   VIEW PROJECT DATA
   Purpose: Retrieve all projects for verification/debugging
   ========================================================= */
SELECT * FROM PROJECTS;


/* =========================================================
   ACCOUNT CREATION
   Purpose: Insert system users with different roles
   ========================================================= */

/* ---------- ADMIN ACCOUNT ---------- */
INSERT INTO ACCOUNTS (
    USER_ID,
    FULL_NAME,
    EMAIL,
    PASSWORD,
    ROLE,
    IS_ACTIVE,
    IS_STAFF,
    IS_SUPERUSER,
    CREATED_AT,
    UPDATED_AT
) VALUES (
    'admin001',
    'Purna Shrestha',
    'purna@gov.np',
    'pbkdf2_sha256$1000000$XORJ30gJz0OdBfwZwrMwTv$FPyd/miJUdQjL4778ifFk7nz8WtC7uQMPv8x6OB06nk=',
    'ADMIN',
    TRUE,
    TRUE,
    TRUE,
    NOW(),
    NOW()
);

/* ---------- ENGINEER ACCOUNT ---------- */
INSERT INTO ACCOUNTS (
    USER_ID, FULL_NAME, EMAIL, PASSWORD, ROLE,
    IS_ACTIVE, IS_STAFF, IS_SUPERUSER, CREATED_AT, UPDATED_AT
) VALUES (
    'eng002',
    'Shreeya Nepal',
    'shreeya@gov.np',
    'pbkdf2_sha256$1000000$XORJ30gJz0OdBfwZwrMwTv$FPyd/miJUdQjL4778ifFk7nz8WtC7uQMPv8x6OB06nk=',
    'USER',
    TRUE,
    FALSE,
    FALSE,
    NOW(),
    NOW()
);

/* ---------- CHAIRPERSON ACCOUNT ---------- */
INSERT INTO ACCOUNTS (
    USER_ID, FULL_NAME, EMAIL, PASSWORD, ROLE,
    IS_ACTIVE, IS_STAFF, IS_SUPERUSER, CREATED_AT, UPDATED_AT
) VALUES (
    'chair001',
    'Reeta Chairperson',
    'reeta.chair@gov.np',
    'pbkdf2_sha256$1000000$XORJ30gJz0OdBfwZwrMwTv$FPyd/miJUdQjL4778ifFk7nz8WtC7uQMPv8x6OB06nk=',
    'USER',
    TRUE,
    FALSE,
    FALSE,
    NOW(),
    NOW()
);

/* ---------- FINANCE ACCOUNT ---------- */
INSERT INTO ACCOUNTS (
    USER_ID, FULL_NAME, EMAIL, PASSWORD, ROLE,
    IS_ACTIVE, IS_STAFF, IS_SUPERUSER, CREATED_AT, UPDATED_AT
) VALUES (
    'fin001',
    'Shristi Finance',
    'shristi.finance@gov.np',
    'pbkdf2_sha256$1000000$XORJ30gJz0OdBfwZwrMwTv$FPyd/miJUdBfwZwrMwTv$FPyd/miJUdQjL4778ifFk7nz8WtC7uQMPv8x6OB06nk=',
    'USER',
    TRUE,
    FALSE,
    FALSE,
    NOW(),
    NOW()
);

/* =========================================================
   VIEW ACCOUNTS
   ========================================================= */
SELECT * FROM ACCOUNTS;


/* =========================================================
   ROLE ASSIGNMENT TABLES
   Purpose: Map accounts to domain-specific roles
   ========================================================= */

/* ---------- ENGINEER ROLE ---------- */
-- Assumes ACCOUNT_ID = 3 corresponds to engineer account
INSERT INTO ENGINEERS (
    WARD_NO,
    ROLE,
    IS_ACTIVE,
    ACCOUNT_ID
) VALUES (
    16,
    'ENGINEER',
    TRUE,
    3
);

SELECT * FROM ENGINEERS;


/* ---------- CHAIRPERSON ROLE ---------- */
-- Assumes ACCOUNT_ID = 4 corresponds to chairperson
INSERT INTO CHAIRPERSONS (
    ACCOUNT_ID,
    TERM_START,
    TERM_END
) VALUES (
    4,
    '2026-01-01',
    '2029-12-31'
);

SELECT * FROM CHAIRPERSONS;


/* ---------- FINANCE ROLE ---------- */
-- Assumes ACCOUNT_ID = 5 corresponds to finance person
INSERT INTO FINANCEPERSONS (
    ACCOUNT_ID
) VALUES (
    5
);

SELECT * FROM FINANCEPERSONS;



--- Transaction safety 
--- `Note`: Only use this if the data are to be inserted as a single unit in case of emergency. Otherwise, it is better to insert data from the UI/application layer to ensure proper validation and error handling.
--- @shreeya

/* =========================================================
   DATABASE SEED SCRIPT
   Purpose:
   - Initialize core system data (accounts, roles, project)
   - Maintain relational integrity using dynamic lookups
   - Ensure safe execution using transactions
   ========================================================= */

BEGIN;


/* =========================================================
   SECTION 1: CREATE ACCOUNTS
   Purpose: Insert base users into the system
   Note: Password is pre-hashed (Django/secure format)
   ========================================================= */

/* ---------- ADMIN ---------- */
INSERT INTO ACCOUNTS (
    USER_ID, FULL_NAME, EMAIL, PASSWORD,
    ROLE, IS_ACTIVE, IS_STAFF, IS_SUPERUSER,
    CREATED_AT, UPDATED_AT
)
VALUES (
    'admin001',
    'Purna Shrestha',
    'purna@gov.np',
    'pbkdf2_sha256$1000000$XORJ30gJz0OdBfwZwrMwTv$FPyd/miJUdQjL4778ifFk7nz8WtC7uQMPv8x6OB06nk=',
    'ADMIN',
    TRUE, TRUE, TRUE,
    NOW(), NOW()
)
ON CONFLICT (USER_ID) DO NOTHING;


/* ---------- ENGINEER ---------- */
INSERT INTO ACCOUNTS (
    USER_ID, FULL_NAME, EMAIL, PASSWORD,
    ROLE, IS_ACTIVE, IS_STAFF, IS_SUPERUSER,
    CREATED_AT, UPDATED_AT
)
VALUES (
    'eng002',
    'Shreeya Nepal',
    'shreeya@gov.np',
    'pbkdf2_sha256$1000000$XORJ30gJz0OdBfwZwrMwTv$FPyd/miJUdQjL4778ifFk7nz8WtC7uQMPv8x6OB06nk=',
    'USER',
    TRUE, FALSE, FALSE,
    NOW(), NOW()
)
ON CONFLICT (USER_ID) DO NOTHING;


/* ---------- CHAIRPERSON ---------- */
INSERT INTO ACCOUNTS (
    USER_ID, FULL_NAME, EMAIL, PASSWORD,
    ROLE, IS_ACTIVE, IS_STAFF, IS_SUPERUSER,
    CREATED_AT, UPDATED_AT
)
VALUES (
    'chair001',
    'Reeta Chairperson',
    'reeta.chair@gov.np',
    'pbkdf2_sha256$1000000$XORJ30gJz0OdBfwZwrMwTv$FPyd/miJUdQjL4778ifFk7nz8WtC7uQMPv8x6OB06nk=',
    'USER',
    TRUE, FALSE, FALSE,
    NOW(), NOW()
)
ON CONFLICT (USER_ID) DO NOTHING;


/* ---------- FINANCE ---------- */
INSERT INTO ACCOUNTS (
    USER_ID, FULL_NAME, EMAIL, PASSWORD,
    ROLE, IS_ACTIVE, IS_STAFF, IS_SUPERUSER,
    CREATED_AT, UPDATED_AT
)
VALUES (
    'fin001',
    'Shristi Finance',
    'shristi.finance@gov.np',
    'pbkdf2_sha256$1000000$XORJ30gJz0OdBfwZwrMwTv$FPyd/miJUdQjL4778ifFk7nz8WtC7uQMPv8x6OB06nk=',
    'USER',
    TRUE, FALSE, FALSE,
    NOW(), NOW()
)
ON CONFLICT (USER_ID) DO NOTHING;


/* =========================================================
   SECTION 2: ROLE MAPPING TABLES
   Purpose: Assign domain-specific roles using ACCOUNT_ID
   Key Improvement: No hardcoded IDs — using subqueries
   ========================================================= */

/* ---------- ENGINEER ROLE ---------- */
INSERT INTO ENGINEERS (WARD_NO, ROLE, IS_ACTIVE, ACCOUNT_ID)
VALUES (
    16,
    'ENGINEER',
    TRUE,
    (SELECT ID FROM ACCOUNTS WHERE USER_ID = 'eng002')
);


/* ---------- CHAIRPERSON ROLE ---------- */
INSERT INTO CHAIRPERSONS (ACCOUNT_ID, TERM_START, TERM_END)
VALUES (
    (SELECT ID FROM ACCOUNTS WHERE USER_ID = 'chair001'),
    '2026-01-01',
    '2029-12-31'
);


/* ---------- FINANCE ROLE ---------- */
INSERT INTO FINANCEPERSONS (ACCOUNT_ID)
VALUES (
    (SELECT ID FROM ACCOUNTS WHERE USER_ID = 'fin001')
);


/* =========================================================
   SECTION 3: PROJECT CREATION
   Purpose: Insert a project with relational references
   ========================================================= */

INSERT INTO PROJECTS (
    PROJECT_CODE,
    PROJECT_NAME,
    WARD_NO,
    MUNICIPALITY,
    DISTRICT,
    PROVINCE,
    TOTAL_APPROVED_BUDGET,
    PLANNED_START_DATE,
    PLANNED_COMPLETION_DATE,
    PLANNED_DURATION_DAYS,
    ASSIGNED_ENGINEER_ID,
    BUDGET_SOURCE_ID,
    CHAIRPERSON_ID,
    CONTRACTOR_ID,
    FISCAL_YEAR_ID,
    LOCATION,
    PRIORITY,
    STATUS,
    PROJECT_DESCRIPTION,
    CONTRACTOR_CONTACT_PERSON,
    CREATED_AT
)
VALUES (
    'PUR-2026-03',
    'Purna Road Construction',
    1,
    'Kathmandu',
    'Kathmandu',
    'Bagmati',
    50000000,
    '2026-03-01',
    '2026-06-01',
    92,

    /* Dynamically assign engineer */
    (SELECT ID FROM ENGINEERS
     WHERE ACCOUNT_ID = (SELECT ID FROM ACCOUNTS WHERE USER_ID = 'eng002')
     LIMIT 1),

    1,

    /* Dynamically assign chairperson */
    (SELECT ID FROM CHAIRPERSONS
     WHERE ACCOUNT_ID = (SELECT ID FROM ACCOUNTS WHERE USER_ID = 'chair001')
     LIMIT 1),

    1,
    1,
    'Kathmandu',
    'HIGH',
    'ONGOING',
    'Road construction project aimed at improving transportation infrastructure.',
    '',
    NOW()
);


/* =========================================================
   SECTION 4: VERIFICATION QUERIES
   Purpose: Validate inserted data
   ========================================================= */

SELECT * FROM ACCOUNTS;
SELECT * FROM ENGINEERS;
SELECT * FROM CHAIRPERSONS;
SELECT * FROM FINANCEPERSONS;
SELECT * FROM PROJECTS;


COMMIT;