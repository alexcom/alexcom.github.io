---
layout: post
title:  "Любопытные паттерны в Java-программировании"
date:   2016-05-12 19:00:00
categories: java curious_patterns
---
<font color="red">THIS IS A DRAFT</font>
Сразу оговорюсь: эта заметка не является инструкцией к действию. Я не утверждаю, что надо делать так или иначе. Сдесь всего лишь собраны конструкции, которые произвели на меня впечатление любого рода, будь то понимание, что конструкция невероятно полезна или являет собой совершеннейший бред. Не важно. 


###Local return

{% syntaxhighlight java %}
	public static void main(String[] args)
	{
		System.out.println("1");
		test :
		{
			System.out.println("2");
			if (true)	// this check prevents compiler from knowing that line 3 is
						// not reachable
			{
				break test;
			}
			System.out.println("3");// 3
		}
		System.out.println("4");
	}
{% end syntaxhighlight %}

###Enum strategy


###
