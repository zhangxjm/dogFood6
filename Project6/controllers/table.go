package controllers

import (
	"farmhouse-order-system/models"
	"encoding/json"

	"github.com/astaxie/beego"
	"github.com/astaxie/beego/orm"
)

type TableController struct {
	beego.Controller
}

func (c *TableController) List() {
	o := orm.NewOrm()
	var tables []models.Table
	o.QueryTable("dining_table").OrderBy("number").All(&tables)

	c.Data["json"] = tables
	c.ServeJSON()
}

func (c *TableController) Get() {
	id, _ := c.GetInt(":id")
	o := orm.NewOrm()
	var table models.Table
	err := o.QueryTable("dining_table").Filter("id", id).One(&table)
	if err != nil {
		c.Data["json"] = map[string]interface{}{"error": "桌台不存在"}
		c.ServeJSON()
		return
	}
	c.Data["json"] = table
	c.ServeJSON()
}

func (c *TableController) Add() {
	var table models.Table
	if err := json.Unmarshal(c.Ctx.Input.RequestBody, &table); err != nil {
		c.Data["json"] = map[string]interface{}{"error": "参数错误"}
		c.ServeJSON()
		return
	}

	if table.Number == "" || table.Seats <= 0 {
		c.Data["json"] = map[string]interface{}{"error": "桌台号和座位数不能为空"}
		c.ServeJSON()
		return
	}

	table.Status = "空闲"
	o := orm.NewOrm()
	id, err := o.Insert(&table)
	if err != nil {
		c.Data["json"] = map[string]interface{}{"error": "添加失败: " + err.Error()}
		c.ServeJSON()
		return
	}

	c.Data["json"] = map[string]interface{}{"id": id, "message": "添加成功"}
	c.ServeJSON()
}

func (c *TableController) Update() {
	id, _ := c.GetInt(":id")
	var table models.Table
	if err := json.Unmarshal(c.Ctx.Input.RequestBody, &table); err != nil {
		c.Data["json"] = map[string]interface{}{"error": "参数错误"}
		c.ServeJSON()
		return
	}

	table.Id = id
	o := orm.NewOrm()
	_, err := o.Update(&table, "number", "seats", "status")
	if err != nil {
		c.Data["json"] = map[string]interface{}{"error": "更新失败: " + err.Error()}
		c.ServeJSON()
		return
	}

	c.Data["json"] = map[string]interface{}{"message": "更新成功"}
	c.ServeJSON()
}

func (c *TableController) Delete() {
	id, _ := c.GetInt(":id")
	o := orm.NewOrm()
	_, err := o.Delete(&models.Table{Id: id})
	if err != nil {
		c.Data["json"] = map[string]interface{}{"error": "删除失败"}
		c.ServeJSON()
		return
	}
	c.Data["json"] = map[string]interface{}{"message": "删除成功"}
	c.ServeJSON()
}
