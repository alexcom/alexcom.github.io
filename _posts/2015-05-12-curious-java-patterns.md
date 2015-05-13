---
layout: post
title:  "Любопытные паттерны в Java-программировании"
date:   2016-05-12 19:00:00
categories: idea eclipse migration pain
---
###Local return


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

###Enum strategy


###