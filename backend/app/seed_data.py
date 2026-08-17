"""
Seeds the database with the same policies/applications/notifications the
old frontend mock (src/data/mockData.ts) shipped with, so the app has
real data to run against on day one. Premium formula columns are left at
their default (placeholder) coefficients — update via
PATCH /policies/{id}/formula once you have the real numbers.

Run with:  python -m app.seed_data
"""
from datetime import date

from app.database import Base, engine, SessionLocal
from app import models

POLICIES = [
    dict(id="jeevan-anand", code="LIC-915", name="LIC Jeevan Anand", category="Endowment",
         tagline="Lifetime protection with guaranteed savings",
         description="A participating non-linked plan offering an attractive combination of protection and "
                      "savings, with cover continuing throughout life after the policy term.",
         min_age=18, max_age=50, min_term=15, max_term=35, min_sum_assured=100000,
         benefits=["Guaranteed additions", "Whole-life coverage", "Loan facility", "Tax benefits under 80C & 10(10D)"],
         eligibility=["Age 18–50 years", "Minimum sum assured ₹1,00,000", "Medical check-up may apply"],
         documents=["Aadhaar / PAN", "Address proof", "Income proof", "Recent photograph"],
         featured=True, rating=4.7, popularity=92),
    dict(id="tech-term", code="LIC-854", name="LIC Tech Term", category="Term",
         tagline="Pure protection at affordable premiums",
         description="A non-linked, non-participating online term insurance plan providing financial protection "
                      "to the insured's family in case of unfortunate demise.",
         min_age=18, max_age=65, min_term=10, max_term=40, min_sum_assured=5000000,
         benefits=["High cover, low premium", "Two benefit options", "Special rates for women", "Optional accident rider"],
         eligibility=["Age 18–65 years", "Minimum cover ₹50,00,000"],
         documents=["PAN", "Aadhaar", "Income proof", "Medical questionnaire"],
         featured=True, rating=4.8, popularity=96),
    dict(id="new-jeevan-shanti", code="LIC-858", name="New Jeevan Shanti", category="Pension",
         tagline="Guaranteed lifelong annuity income",
         description="A single premium plan wherein the policyholder has an option of choosing Deferred "
                      "Annuity for Single/Joint life.",
         min_age=30, max_age=79, min_term=1, max_term=12, min_sum_assured=150000,
         benefits=["Guaranteed rates", "Deferment period", "Death benefit", "Loan available"],
         eligibility=["Age 30–79 years", "Purchase price min ₹1,50,000"],
         documents=["Aadhaar", "PAN", "Bank details"],
         featured=True, rating=4.5, popularity=78),
    dict(id="sanchay-plus", code="LIC-865", name="LIC Bima Jyoti", category="Endowment",
         tagline="Guaranteed additions every year",
         description="A non-linked, non-participating, individual, limited premium payment life insurance "
                      "savings plan.",
         min_age=0, max_age=60, min_term=15, max_term=20, min_sum_assured=100000,
         benefits=["Guaranteed additions ₹50/₹1000", "Death & maturity benefit", "Rider options"],
         eligibility=["Age 90 days – 60 years"],
         documents=["Aadhaar", "PAN", "Address proof"],
         featured=False, rating=4.4, popularity=71),
    dict(id="jeevan-tarun", code="LIC-834", name="LIC Jeevan Tarun", category="Child",
         tagline="Secure your child's future & dreams",
         description="Specially designed to meet the educational and other needs of growing children through "
                      "annual survival benefits.",
         min_age=0, max_age=12, min_term=13, max_term=25, min_sum_assured=75000,
         benefits=["Survival benefits from age 20", "Maturity benefit at 25", "Optional premium waiver rider"],
         eligibility=["Child age 90 days – 12 years"],
         documents=["Child's birth certificate", "Parent's ID", "Address proof"],
         featured=False, rating=4.6, popularity=82),
    dict(id="new-endowment", code="LIC-914", name="LIC New Endowment Plan", category="Endowment",
         tagline="Savings + protection made simple",
         description="A participating non-linked plan offering an attractive combination of protection and "
                      "saving features.",
         min_age=8, max_age=55, min_term=12, max_term=35, min_sum_assured=100000,
         benefits=["Bonus additions", "Loan facility", "Rider options"],
         eligibility=["Age 8–55 years"],
         documents=["Aadhaar", "PAN", "Income proof"],
         featured=False, rating=4.3, popularity=68),
    dict(id="cancer-cover", code="LIC-905", name="LIC Cancer Cover", category="Health",
         tagline="Comprehensive cover against cancer",
         description="A regular premium payment health insurance plan providing financial protection in case "
                      "of diagnosis of specified stages of cancer.",
         min_age=20, max_age=65, min_term=10, max_term=30, min_sum_assured=1000000,
         benefits=["Early & major stage benefit", "Premium waiver", "Income benefit"],
         eligibility=["Age 20–65 years"],
         documents=["Medical reports", "Aadhaar", "PAN"],
         featured=False, rating=4.5, popularity=74),
]


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(models.Policy).count() == 0:
            for p in POLICIES:
                db.add(models.Policy(**p))
            db.commit()
            print(f"Seeded {len(POLICIES)} policies.")
        else:
            print("Policies already present, skipping seed.")

        # Demo user + a couple of applications/notifications, only on first run
        demo = db.query(models.User).filter(models.User.email == "demo@policywise.in").first()
        if not demo:
            from app.auth import hash_password
            demo = models.User(
                full_name="Demo Customer",
                email="demo@policywise.in",
                hashed_password=hash_password("password123"),
                phone="+91 98XXXXXX00",
                address="Mumbai, Maharashtra",
                nominee="Family Member",
            )
            db.add(demo)
            db.commit()
            db.refresh(demo)

            db.add(models.Application(
                user_id=demo.id, policy_id="jeevan-anand", policy_name="LIC Jeevan Anand",
                status="Under Review", applied_date=date(2026, 6, 14),
                agent_name="Rohit Sharma", agent_phone="+91 98765 43210", agent_email="rohit.s@licindia.in",
                timeline=[
                    {"label": "Application Submitted", "date": "2026-06-14", "done": True},
                    {"label": "Documents Verified", "date": "2026-06-16", "done": True},
                    {"label": "Medical Review", "date": "2026-06-22", "done": False},
                    {"label": "Policy Issuance", "date": "—", "done": False},
                ],
            ))
            db.add(models.Notification(
                user_id=demo.id, title="Premium due in 5 days",
                body="Your Jeevan Anand premium of ₹12,450 is due on 05 Aug.",
                type="warning", read=False, date=date(2026, 7, 21),
            ))
            db.add(models.Notification(
                user_id=demo.id, title="Application approved",
                body="Your Tech Term application has been approved.",
                type="success", read=False, date=date(2026, 7, 18),
            ))
            db.commit()
            print("Seeded demo user (demo@policywise.in / password123) with sample data.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
