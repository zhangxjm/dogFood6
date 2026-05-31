package main

import (
	_ "farmhouse-order-system/routers"
	"farmhouse-order-system/models"
	"github.com/astaxie/beego"
	"github.com/astaxie/beego/orm"
	_ "github.com/go-sql-driver/mysql"
)

func init() {
	orm.RegisterDriver("mysql", orm.DRMySQL)
	orm.RegisterDataBase("default", "mysql", beego.AppConfig.String("mysqluser")+":"+
		beego.AppConfig.String("mysqlpass")+"@tcp("+beego.AppConfig.String("mysqlhost")+":"+
		beego.AppConfig.String("mysqlport")+")/"+beego.AppConfig.String("mysqldb")+"?charset=utf8&parseTime=true&loc=Local")
}

func main() {
	models.InitDatabase()
	beego.SetStaticPath("/static", "static")
	beego.BConfig.WebConfig.Session.SessionOn = true
	beego.Run()
}
