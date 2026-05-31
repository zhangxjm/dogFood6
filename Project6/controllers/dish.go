package controllers

import (
	"farmhouse-order-system/models"
	"encoding/json"
	"strconv"

	"github.com/astaxie/beego"
	"github.com/astaxie/beego/orm"
)

type DishController struct {
	beego.Controller
}

func (c *DishController) List() {
	o := orm.NewOrm()
	var dishes []models.Dish
	o.QueryTable("dish").OrderBy("-id").All(&dishes)

	c.Data["json"] = dishes
	c.ServeJSON()
}

func (c *DishController) Get() {
	id, _ := c.GetInt(":id")
	o := orm.NewOrm()
	var dish models.Dish
	err := o.QueryTable("dish").Filter("id", id).One(&dish)
	if err != nil {
		c.Data["json"] = map[string]interface{}{"error": "菜品不存在"}
		c.ServeJSON()
		return
	}
	c.Data["json"] = dish
	c.ServeJSON()
}

func (c *DishController) Add() {
	var dish models.Dish
	if err := json.Unmarshal(c.Ctx.Input.RequestBody, &dish); err != nil {
		c.Data["json"] = map[string]interface{}{"error": "参数错误"}
		c.ServeJSON()
		return
	}

	if dish.Name == "" || dish.Price <= 0 {
		c.Data["json"] = map[string]interface{}{"error": "菜品名称和价格不能为空"}
		c.ServeJSON()
		return
	}

	o := orm.NewOrm()
	dish.Status = 1
	id, err := o.Insert(&dish)
	if err != nil {
		c.Data["json"] = map[string]interface{}{"error": "添加失败: " + err.Error()}
		c.ServeJSON()
		return
	}

	c.Data["json"] = map[string]interface{}{"id": id, "message": "添加成功"}
	c.ServeJSON()
}

func (c *DishController) Update() {
	id, _ := c.GetInt(":id")
	var dish models.Dish
	if err := json.Unmarshal(c.Ctx.Input.RequestBody, &dish); err != nil {
		c.Data["json"] = map[string]interface{}{"error": "参数错误"}
		c.ServeJSON()
		return
	}

	dish.Id = id
	o := orm.NewOrm()
	_, err := o.Update(&dish, "name", "description", "price", "category", "image", "status")
	if err != nil {
		c.Data["json"] = map[string]interface{}{"error": "更新失败: " + err.Error()}
		c.ServeJSON()
		return
	}

	c.Data["json"] = map[string]interface{}{"message": "更新成功"}
	c.ServeJSON()
}

func (c *DishController) Delete() {
	id, _ := c.GetInt(":id")
	o := orm.NewOrm()
	_, err := o.Delete(&models.Dish{Id: id})
	if err != nil {
		c.Data["json"] = map[string]interface{}{"error": "删除失败"}
		c.ServeJSON()
		return
	}
	c.Data["json"] = map[string]interface{}{"message": "删除成功"}
	c.ServeJSON()
}

func (c *DishController) ListView() {
	o := orm.NewOrm()
	var dishes []models.Dish
	o.QueryTable("dish").OrderBy("-id").All(&dishes)
	c.Data["dishes"] = dishes
	c.TplName = "dishes.html"
}

func (c *DishController) AddView() {
	c.TplName = "dish-add.html"
}

func (c *DishController) EditView() {
	idStr := c.GetString("id")
	id, _ := strconv.Atoi(idStr)
	o := orm.NewOrm()
	var dish models.Dish
	o.QueryTable("dish").Filter("id", id).One(&dish)
	c.Data["dish"] = dish
	c.TplName = "dish-edit.html"
}
