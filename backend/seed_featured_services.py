"""
Seed script to add featured services matching the frontend data
Run this after running the initial seed.py to add providers and categories
"""
import asyncio
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import SessionLocal
from app.models.user import User, UserRole
from app.models.service import Service, Category
from app.models.provider import ProviderProfile
from app.models.review import Review
from app.core.security import get_password_hash


async def seed_featured_services():
    async with SessionLocal() as db:
        # Create categories needed for featured services
        category_mapping = {
            "Home Services": "Home and office cleaning, plumbing, and repairs",
            "Fitness": "Personal training and fitness programs",
            "Beauty": "Hair styling, makeup, and beauty services",
            "Wellness": "Massage therapy, yoga, and wellness services",
            "Pet Care": "Pet grooming and pet care services",
        }
        
        categories = {}
        for cat_name, cat_desc in category_mapping.items():
            result = await db.execute(select(Category).where(Category.name == cat_name))
            category = result.scalar_one_or_none()
            
            if not category:
                category = Category(name=cat_name, description=cat_desc)
                db.add(category)
                await db.flush()
                print(f"Created category: {cat_name}")
            
            categories[cat_name] = category
        
        await db.commit()
        
        # Define featured services with provider info
        featured_services = [
            {
                "title": "Home Cleaning",
                "provider_name": "Sparkle Clean Co.",
                "provider_email": "sparkle@cleaning.com",
                "rating": 4.9,
                "reviews": 328,
                "price": 80,
                "duration": 150,  # 2.5 hrs in minutes
                "location": "Your Location",
                "image": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop",
                "category": "Home Services",
                "description": "Professional home cleaning service with eco-friendly products",
            },
            {
                "title": "Personal Training",
                "provider_name": "FitLife Studio",
                "provider_email": "fitlife@studio.com",
                "rating": 4.8,
                "reviews": 215,
                "price": 65,
                "duration": 60,
                "location": "Downtown Gym",
                "image": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop",
                "category": "Fitness",
                "description": "Personalized training programs for all fitness levels",
            },
            {
                "title": "Hair Styling",
                "provider_name": "Luxe Salon",
                "provider_email": "luxe@salon.com",
                "rating": 5.0,
                "reviews": 412,
                "price": 55,
                "duration": 45,
                "location": "Main Street",
                "image": "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop",
                "category": "Beauty",
                "description": "Expert hair styling and cuts by certified stylists",
            },
            {
                "title": "Plumbing Repair",
                "provider_name": "Quick Fix Pros",
                "provider_email": "quickfix@pros.com",
                "rating": 4.7,
                "reviews": 189,
                "price": 95,
                "duration": 90,  # 1.5 hrs
                "location": "Your Location",
                "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
                "category": "Home Services",
                "description": "Fast and reliable plumbing repair services",
            },
            {
                "title": "Massage Therapy",
                "provider_name": "Zen Wellness",
                "provider_email": "zen@wellness.com",
                "rating": 4.9,
                "reviews": 276,
                "price": 90,
                "duration": 60,
                "location": "Wellness Center",
                "image": "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=300&fit=crop",
                "category": "Wellness",
                "description": "Relaxing massage therapy for stress relief and recovery",
            },
            {
                "title": "Pet Grooming",
                "provider_name": "Pawfect Care",
                "provider_email": "pawfect@care.com",
                "rating": 4.8,
                "reviews": 167,
                "price": 45,
                "duration": 60,
                "location": "Pet Plaza",
                "image": "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=400&h=300&fit=crop",
                "category": "Pet Care",
                "description": "Professional pet grooming with care and attention",
            },
        ]
        
        # Create providers and services
        for service_data in featured_services:
            # Check if provider already exists
            result = await db.execute(
                select(User).where(User.email == service_data["provider_email"])
            )
            provider = result.scalar_one_or_none()
            
            if not provider:
                # Create provider user
                provider = User(
                    email=service_data["provider_email"],
                    hashed_password=get_password_hash("password123"),
                    full_name=service_data["provider_name"],
                    role=UserRole.PROVIDER
                )
                db.add(provider)
                await db.flush()
                
                # Create provider profile
                profile = ProviderProfile(
                    user_id=provider.id,
                    business_name=service_data["provider_name"],
                    bio=f"Professional {service_data['category']} provider",
                    location=service_data["location"],
                    availability={"mon": "09:00-18:00", "tue": "09:00-18:00", 
                                 "wed": "09:00-18:00", "thu": "09:00-18:00", 
                                 "fri": "09:00-18:00"}
                )
                db.add(profile)
                print(f"Created provider: {service_data['provider_name']}")
            
            # Check if service already exists
            result = await db.execute(
                select(Service).where(
                    Service.name == service_data["title"],
                    Service.provider_id == provider.id
                )
            )
            existing_service = result.scalar_one_or_none()
            
            if not existing_service:
                # Create service
                service = Service(
                    name=service_data["title"],
                    description=service_data["description"],
                    price=service_data["price"],
                    duration_minutes=service_data["duration"],
                    category_id=categories[service_data["category"]].id,
                    provider_id=provider.id,
                    image_url=service_data["image"],
                    location=service_data["location"]
                )
                db.add(service)
                await db.flush()
                
                # Create sample reviews to match the rating and review count
                # We'll create reviews to achieve the target rating
                num_reviews = service_data["reviews"]
                target_rating = service_data["rating"]
                
                # Create sample customers for reviews (or use existing ones)
                sample_reviews = []
                for i in range(min(num_reviews, 10)):  # Create up to 10 actual reviews
                    # Vary ratings around the target
                    if target_rating >= 4.8:
                        rating = 5.0 if i % 3 != 0 else 4.0
                    elif target_rating >= 4.5:
                        rating = 5.0 if i % 2 == 0 else 4.0
                    else:
                        rating = 5.0 if i % 3 == 0 else 4.0
                    
                    # Check if customer exists, or create a dummy one
                    customer_email = f"customer{i}@example.com"
                    result = await db.execute(select(User).where(User.email == customer_email))
                    customer = result.scalar_one_or_none()
                    
                    if not customer:
                        customer = User(
                            email=customer_email,
                            hashed_password=get_password_hash("password123"),
                            full_name=f"Customer {i+1}",
                            role=UserRole.CUSTOMER
                        )
                        db.add(customer)
                        await db.flush()
                    
                    review = Review(
                        customer_id=customer.id,
                        service_id=service.id,
                        rating=rating,
                        comment=f"Great service! {'Highly recommend.' if rating == 5.0 else 'Good experience.'}"
                    )
                    db.add(review)
                    sample_reviews.append(review)
                
                print(f"Created service: {service_data['title']} with {len(sample_reviews)} reviews")
            else:
                print(f"Service {service_data['title']} already exists, skipping...")
        
        await db.commit()
        print("\n✅ Featured services seeded successfully!")
        print("Note: Run migrations first if the 'location' column doesn't exist")


if __name__ == "__main__":
    asyncio.run(seed_featured_services())
