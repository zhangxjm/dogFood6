package controllers

import (
	"github.com/astaxie/beego"
)

type MainController struct {
	beego.Controller
}

func (c *MainController) Get() {
	username := c.GetSession("username")
	if username == nil {
		c.Redirect("/login", 302)
		return
	}
	c.Data["username"] = username.(string)
	c.Data["role"] = c.GetSession("role")
	c.TplName = "index.html"
}
