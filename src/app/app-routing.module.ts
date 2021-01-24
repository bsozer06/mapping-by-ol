import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MappingComponent } from './mapping/mapping.component';


const routes: Routes = [
  { path: "mapinfo", component: MappingComponent },
  { path: "dashboard", component: DashboardComponent },
  { path: "", component: DashboardComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
