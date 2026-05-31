from decimal import Decimal
from django.db.models import Count, Q
from django.contrib.auth.models import User
from apps.members.models import UserBehavior
from apps.products.models import Product, Category
from apps.recommendations.models import UserPreference, RecommendationLog


ACTION_WEIGHTS = {
    'browse': 1,
    'favorite': 2,
    'purchase': 3,
}


class RecommendationService:

    @staticmethod
    def get_recommendations(user, limit=10):
        content_products = RecommendationService._content_based(user, limit)
        collab_products = RecommendationService._collaborative(user, limit)
        seen = set()
        results = []
        for item in content_products + collab_products:
            if item.id not in seen:
                seen.add(item.id)
                results.append(item)
            if len(results) >= limit:
                break
        return results[:limit]

    @staticmethod
    def _content_based(user, limit):
        try:
            preference = UserPreference.objects.get(user=user)
        except UserPreference.DoesNotExist:
            return []
        weights = preference.category_weights
        if not weights:
            return []
        sorted_cats = sorted(weights.items(), key=lambda x: x[1], reverse=True)
        products = []
        for cat_id, weight in sorted_cats:
            cat_products = Product.objects.filter(
                category_id=cat_id, is_active=True
            ).exclude(
                id__in=[p.id for p in products]
            )[:limit]
            products.extend(cat_products)
            if len(products) >= limit:
                break
        return products[:limit]

    @staticmethod
    def _collaborative(user, limit):
        user_product_ids = UserBehavior.objects.filter(
            user=user
        ).values_list('product_id', flat=True)
        similar_users = UserBehavior.objects.filter(
            product_id__in=user_product_ids
        ).exclude(user=user).values('user').annotate(
            common_count=Count('product_id', distinct=True)
        ).order_by('-common_count')[:5]
        if not similar_users:
            return []
        similar_user_ids = [u['user'] for u in similar_users]
        recommended_product_ids = UserBehavior.objects.filter(
            user_id__in=similar_user_ids,
            action_type='purchase'
        ).exclude(
            product_id__in=user_product_ids
        ).values_list('product_id', flat=True).distinct()[:limit]
        return Product.objects.filter(id__in=recommended_product_ids, is_active=True)

    @staticmethod
    def get_similar_products(product_id, limit=6):
        product = Product.objects.get(id=product_id)
        price_range = product.price * Decimal('0.5')
        similar = Product.objects.filter(
            category=product.category,
            is_active=True,
            price__gte=product.price - price_range,
            price__lte=product.price + price_range,
        ).exclude(id=product_id)[:limit]
        return similar

    @staticmethod
    def record_behavior(user, product, action_type):
        behavior, created = UserBehavior.objects.get_or_create(
            user=user,
            product=product,
            action_type=action_type,
        )
        if not created:
            return behavior
        weight = ACTION_WEIGHTS.get(action_type, 1)
        preference, _ = UserPreference.objects.get_or_create(user=user)
        cat_id = str(product.category_id)
        current = preference.category_weights.get(cat_id, 0)
        preference.category_weights[cat_id] = current + weight
        preference.save()
        return behavior
