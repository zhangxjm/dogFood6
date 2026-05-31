from django.db import models


class Category(models.Model):
    name = models.CharField('分类名称', max_length=50)
    icon = models.CharField('分类图标', max_length=500, blank=True, default='')
    parent = models.ForeignKey('self', verbose_name='父级分类', on_delete=models.CASCADE, null=True, blank=True, related_name='children')

    class Meta:
        verbose_name = '商品分类'
        verbose_name_plural = '商品分类'

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField('商品名称', max_length=200)
    description = models.TextField('商品描述')
    price = models.DecimalField('价格', max_digits=10, decimal_places=2)
    image = models.CharField('商品图片', max_length=500, blank=True, default='')
    category = models.ForeignKey(Category, verbose_name='所属分类', on_delete=models.CASCADE, related_name='products')
    is_customizable = models.BooleanField('是否可定制', default=False)
    is_active = models.BooleanField('是否上架', default=True)
    story = models.TextField('非遗故事', blank=True, default='')
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '商品'
        verbose_name_plural = '商品'
        ordering = ['-created_at']

    def __str__(self):
        return self.name
