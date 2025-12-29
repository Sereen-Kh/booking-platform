import asyncio
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import SessionLocal
from app.models.user import User, UserRole
from app.models.service import Service, Category
from app.models.provider import ProviderProfile
from app.core.security import get_password_hash


async def seed():
    async with SessionLocal() as db:
        # 1. Create Categories (if they don't exist)
        existing_categories = await db.execute(select(Category))
        existing_categories = existing_categories.scalars().all()

        if not existing_categories:
            categories = [
                Category(name="Cleaning",
                         description="Home and office cleaning services"),
                Category(name="Plumbing",
                         description="Professional plumbing and pipe repair"),
                Category(
                    name="Photography", description="Events, portraits, and commercial photography"),
                Category(name="Wellness",
                         description="Yoga, massage, and personal training"),
            ]
            db.add_all(categories)
            await db.commit()
            print("Categories created!")
        else:
            categories = existing_categories
            print("Categories already exist!")

        # 2. Create Providers (if they don't exist)
        provider_data = [
            {"email": "alice@cleaning.com", "name": "Alice Smith",
                "biz": "Sparkle Clean", "cat_idx": 0},
            {"email": "bob@plumbing.com", "name": "Bob Jones",
                "biz": "Quick Fix Plumbing", "cat_idx": 1},
            {"email": "charlie@photo.com", "name": "Charlie Brown",
                "biz": "Golden Hour Studios", "cat_idx": 2},
        ]

        for data in provider_data:
            # Check if user already exists
            result = await db.execute(select(User).where(User.email == data["email"]))
            existing_user = result.scalar_one_or_none()

            if existing_user:
                print(f"User {data['email']} already exists, skipping...")
                continue

            user = User(
                email=data["email"],
                hashed_password=get_password_hash("pass123"),
                full_name=data["name"],
                role=UserRole.PROVIDER
            )
            db.add(user)
            await db.flush()

            profile = ProviderProfile(
                user_id=user.id,
                business_name=data["biz"],
                bio=f"Top rated professional in {categories[data['cat_idx']].name}",
                location="San Francisco, CA",
                availability={"mon": "09:00-17:00", "tue": "09:00-17:00"}
            )
            db.add(profile)

            service = Service(
                name=f"Deluxe {categories[data['cat_idx']].name} Package",
                description=f"High quality {categories[data['cat_idx']].name.lower()} service by {data['biz']}.",
                price=99.0 + (data['cat_idx'] * 50),
                duration_minutes=60,
                category_id=categories[data['cat_idx']].id,
                provider_id=user.id
            )
            db.add(service)
            print(f"Created user {data['email']} with service")

        await db.commit()
        print("Database seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed())
