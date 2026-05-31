package controllers

import (
	"farmhouse-order-system/models"

	"github.com/astaxie/beego"
	"github.com/astaxie/beego/orm"
)

type LoginController struct {
	beego.Controller
}

func (c *LoginController) Get() {
	c.TplName = "login.html"
}

func (c *LoginController) Post() {
	username := c.GetString("username")
	password := c.GetString("password")

	if username == "" || password == "" {
		c.Data["error"] = "用户名和密码不能为空"
		c.TplName = "login.html"
		return
	}

	o := orm.NewOrm()
	var user models.User
	err := o.QueryTable("user").Filter("username", username).Filter("password", password).One(&user)
	if err != nil {
		c.Data["error"] = "用户名或密码错误"
		c.TplName = "login.html"
		return
	}

	c.SetSession("user_id", user.Id)
	c.SetSession("username", user.Username)
	c.SetSession("role", user.Role)

	c.Redirect("/", 302)
}

type LogoutController struct {
	beego.Controller
}

func (c *LogoutController) Get() {
	c.DestroySession()
	c.Redirect("/login", 302)
}
