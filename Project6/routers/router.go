package routers

import (
	"farmhouse-order-system/controllers"

	"github.com/astaxie/beego"
)

func init() {
	beego.Router("/", &controllers.MainController{})
	beego.Router("/login", &controllers.LoginController{})
	beego.Router("/logout", &controllers.LogoutController{})

	beego.Router("/dishes", &controllers.DishController{}, "get:List")
	beego.Router("/dishes/add", &controllers.DishController{}, "post:Add")
	beego.Router("/dishes/update/:id:int", &controllers.DishController{}, "post:Update")
	beego.Router("/dishes/delete/:id:int", &controllers.DishController{}, "post:Delete")
	beego.Router("/dishes/:id:int", &controllers.DishController{}, "get:Get")

	beego.Router("/tables", &controllers.TableController{}, "get:List")
	beego.Router("/tables/add", &controllers.TableController{}, "post:Add")
	beego.Router("/tables/update/:id:int", &controllers.TableController{}, "post:Update")
	beego.Router("/tables/delete/:id:int", &controllers.TableController{}, "post:Delete")
	beego.Router("/tables/:id:int", &controllers.TableController{}, "get:Get")

	beego.Router("/orders", &controllers.OrderController{}, "get:List;post:Add")
	beego.Router("/orders/update/:id:int", &controllers.OrderController{}, "post:Update")
	beego.Router("/orders/delete/:id:int", &controllers.OrderController{}, "post:Delete")
	beego.Router("/orders/:id:int", &controllers.OrderController{}, "get:Get")
	beego.Router("/orders/table/:table_id:int", &controllers.OrderController{}, "get:GetByTable")

	beego.Router("/kitchen", &controllers.KitchenController{}, "get:List")
	beego.Router("/kitchen/complete/:id:int", &controllers.KitchenController{}, "post:Complete")

	beego.Router("/statistics", &controllers.StatisticsController{}, "get:Get")
	beego.Router("/statistics/today", &controllers.StatisticsController{}, "get:GetToday")
}
