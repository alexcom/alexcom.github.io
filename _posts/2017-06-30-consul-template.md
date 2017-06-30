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
3. define upstream block
4. enumerate all server instances inside upstream block

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
Let's remove those things that are not our responsibility. We can do it with a help of tags and simple conditional check. If you didn't tag your services you definitely should! I will not describe it here. Google is your friend.

```
{{- if in $services.Tags "myapp"}}
...
{{end}}
```
Now you only process services that have `myapps` in tag list.


Let's define an upstream.


```
{{range $services := services}}
{{- if in $services.Tags "myapp"}}
upstream {{$services.Name}} {
	{{- range service $services.Name "any"}}
	server {{.Address}}:{{.Port}};
	{{- end}}
}
{{- end}}{{end}}
```
