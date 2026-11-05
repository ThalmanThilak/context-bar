# context-bar

A Claude Code mod that shows a small bar above the prompt with how much of your context window is used, updated after every turn.

```
Context ██████░░░░░░░░░░░░░░ 30% (60k of 200k tokens)
Plan    5-hour limit 12% · Weekly limit 34%
```

- The bar is green below 70%, yellow from 70%, and red from 90%.
- The **Plan** line shows your Claude subscription's 5-hour and weekly usage limits, using the figures Claude Code itself receives. It only appears once Claude Code has a reading; it never estimates.

Works in the Claude Code terminal and the Claude desktop app's Code tab.

## Install

At the prompt of a Claude Code terminal session:

```
/plugin install context-bar --marketplace ThalmanThilak/context-bar
```

Answer `y` to add the marketplace, then pick a scope (user scope makes it load in every session).

From a shell:

```
claude plugin install context-bar --marketplace ThalmanThilak/context-bar
```

In the Claude desktop app: click **+** next to the prompt box, then **Plugins**, **Add marketplace** with `ThalmanThilak/context-bar`, then **Add plugin**.

## Hiding it

The bar sits in the band above the prompt. Click its `[-]` or press `Ctrl+X` then `Ctrl+A` to collapse or show the band.
