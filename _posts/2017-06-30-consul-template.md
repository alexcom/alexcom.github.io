---
published: false
---
## Generating upstreams from Consul data with Consul-template

### (Not so) Boring introduction
Since you are here you want the solution. So cut the crap!

### So you have some services registered in Consul

Guys who wrote Go's templating language are completely insane. As one (Clojure) guy said you have to be a little bit insane to create your own language. This language is too different from all what I used to in Java world. Well... nevermind.

I'll demo this freaking template for a file with NginX upstream definitions.
What we probably want is to
1. iterate over services
2. filter out infrastructural components like DBs, queues etc.
3. if there's at least any instance of each
4. define upstream block
5. enumerate all server instances inside upstream block

Let's see... query and at the same time iteration in this strange language is `range`.

Like this:
```
{{range services}}
...
{{end}}
```
To avoid confusion later I will assign services to variable.
```
{{range $services := services}}
...
{{end}}
```
First checkpoint done. We can reference service name in next commands.
Let's go over all 

```
{{range $services := services -}}
{{with service $services.Name "any" -}}
{{range $service := service $services.Name -}}
{{ if in $service.Tags "myapp" -}}
upstream {{$service.Name}} {
	{{range service $service.Name "any" -}}
	server {{$service.Address}}:{{$service.Port}};
	{{- end}}
}
{{end}}{{end}}{{end}}{{end}}
```