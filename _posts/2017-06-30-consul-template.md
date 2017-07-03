---
published: true
---
## Generating NginX upstreams from Consul data with Consul-template

### (Not so) Boring introduction
Since you are here you want the solution. So cut the crap!

### You have some services registered in Consul

Guys who wrote Go's templating language are insane. As one (Clojure) guy said you have to be a little bit insane to create your own language. And this language is too different from all what I used to in Java world. Well... nevermind.

I'll demo this freaking template for a file with NginX upstream definitions.
What you probably want is to:
1. iterate over services
2. filter out infrastructural components like DBs, queues etc.
3. define upstream block for each service
4. enumerate all service instances inside that block along with their IPs and ports

Let's see... query and at the same time iteration in this strange language is done with `range`.
Like this:
```text
{% raw %}
{{range services}}
...
{{end}}
{% endraw %}
```
To avoid confusion later I will assign services to variable.
```text
{% raw %}
{{range $services := services}}
...
{{end}}
{% endraw %}
```
First checkpoint done. We can reference service name in next commands.
Let's remove those things that are not our responsibility. We can do it with a help of tags and simple conditional check. If you didn't tag your services you definitely should! I will not describe it here though. Google is your friend.

```text
{% raw %}
{{if in $services.Tags "myapp"}}
...
{{end}}
{% endraw %}
```
Now you only process services that have `myapps` in tag list.
Let's define an upstream. We'll reference a service name through variable.

```text
{% raw %}
upstream {{$services.Name}} {
...
}
{% endraw %}
```
Now what's left is to go enumerate service instances using familiar already `range` and `.` as a specifier for current object in server template.
```text
{% raw %}
{{range service $services.Name "any"}}
	server {{.Address}}:{{.Port}};
{{end}}
{% endraw %}
```

To be honest this code will generate a lot of unnecessary whitespaces and newlines which could make config file sparse and strange looking. And it's normal. Fortunately guys behind consul-template implemented a hack to trim those characters. It's done by adding `-` inside curly braces.
Final template could look like this:

```text
{% raw %}
{{range $services := services}}
{{- if in $services.Tags "myapp"}}
upstream {{$services.Name}} {
	{{- range service $services.Name "any"}}
	server {{.Address}}:{{.Port}};
	{{- end}}
}
{{- end}}{{end}}
{% endraw %}
```
