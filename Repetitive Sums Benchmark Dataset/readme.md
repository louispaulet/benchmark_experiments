# Repetitive sums benchmark  

How well do LLMs fare on a 1+1+...+1 sum?  

Below is the current leaderboard.  
Skip to the end to see the benchmark and leaderboard datasets on HuggingFace Hub, and method explanation.  

## Current leaderboard

|   | model_name                            | avg_accuracy | error_mean        | error_median   | error_std         | error_min   | error_max   | parsing_failure_count   |
|---|---------------------------------------|--------------|-------------------|----------------|-------------------|-------------|-------------|-------------------------|
| 0 | claude-3-opus-20240229                | 78.78787878787878 | 2.4285714285714284 | 2.0            | 1.2873006086935783 | 1           | 4           | 0                       |
| 1 | gpt-4o-2024-05-13                     | 72.72727272727273 | 3.6666666666666665 | 2.0            | 3.2581259360842107 | 1           | 12          | 0                       |
| 2 | gpt-4-0125-preview                    | 44.44444444444444 | 11.563636363636364 | 9.0            | 9.681528109342374  | 1           | 34          | 0                       |
| 3 | claude-3-haiku-20240307               | 41.41414141414141 | 9.551724137931034  | 5.0            | 9.756999132054688  | 1           | 33          | 0                       |
| 4 | gemini-1.5-flash                      | 40.4040404040404  | 15.576271186440678 | 13.0           | 12.512343408824837 | 1           | 42          | 0                       |
| 5 | gpt-4-turbo-2024-04-09                | 39.39393939393939 | 14.85              | 10.5           | 12.588432947265384 | 1           | 41          | 0                       |
| 6 | gpt-4-1106-preview                    | 38.38383838383838 | 13.868852459016393 | 9.0            | 11.971459685206959 | 1           | 42          | 0                       |
| 7 | gpt-4-0613                            | 37.37373737373738 | 8.483870967741936  | 5.5            | 7.885953346285978  | 1           | 30          | 0                       |
| 8 | claude-3-sonnet-20240229              | 36.36363636363637 | 7.904761904761905  | 5.0            | 8.025592703897198  | 1           | 30          | 0                       |
| 9 | mistralai/Mixtral-8x22B               | 34.34343434343434 | 15.569230769230769 | 11.0           | 13.677044215090424 | 1           | 43          | 0                       |
| 10 | mistralai/Mixtral-8x22B-Instruct-v0.1 | 32.323232323232325 | 16.059701492537314 | 11.0           | 13.026640066597936 | 1           | 43          | 0                       |
| 11 | gemini-1.0-pro                        | 31.313131313131315 | 15.725806451612904 | 6.0            | 35.22674531381729  | 1           | 273         | 6                       |
| 12 | gemini-1.5-pro                        | 30.303030303030305 | 10.289855072463768 | 9.0            | 7.677510030785032  | 1           | 28          | 0                       |
| 13 | microsoft/WizardLM-2-8x22B            | 26.262626262626267 | 13.027397260273972 | 10.0           | 10.825603142986392 | 1           | 38          | 0                       |
| 14 | Qwen/Qwen2-72B-Instruct               | 26.262626262626267 | 23.534246575342465 | 22.0           | 15.923499573290364 | 1           | 54          | 0                       |
| 15 | gpt-3.5-turbo-0125                    | 24.242424242424242 | 6.573333333333333  | 6.0            | 5.131180079573217  | 1           | 20          | 0                       |
| 16 | meta-llama/Llama-3-70b-chat-hf        | 22.22222222222222  | 9.883116883116884  | 8.0            | 7.290899204476962  | 1           | 26          | 0                       |
| 17 | Qwen/Qwen1.5-32B-Chat                 | 21.21212121212121  | 12.807692307692308 | 11.0           | 9.45812052979047   | 1           | 36          | 0                       |
| 18 | Qwen/Qwen1.5-72B-Chat                 | 20.2020202020202   | 13.772151898734178 | 9.0            | 11.787596008895905 | 1           | 40          | 0                       |
| 19 | meta-llama/Llama-3-8b-chat-hf         | 18.181818181818183 | 30.123456790123456 | 29.0           | 21.926230134276036 | 1           | 69          | 0                       |
| 20 | gpt-3.5-turbo-1106                    | 18.181818181818183 | 7.75               | 6.5            | 6.081940479813988  | 1           | 23          | 5                       |
| 21 | zero-one-ai/Yi-34B-Chat               | 17.17171717171717  | 40.51219512195122  | 29.5           | 60.79884743515242  | 1           | 340         | 0                       |
| 22 | mistralai/Mistral-7B-Instruct-v0.3    | 16.161616161616163 | 29.819277108433734 | 28.0           | 21.680689721227232 | 1           | 69          | 0                       |
| 23 | Qwen/Qwen1.5-14B-Chat                 | 14.14141414141414  | 29.41176470588235  | 30.0           | 16.92862756907804  | 1           | 60          | 0                       |
| 24 | google/gemma-7b                       | 13.131313131313133 | 47.75581395348837  | 54.0           | 29.661199073978047 | 1           | 99          | 0                       |
| 25 | NousResearch/Nous-Hermes-2-Yi-34B     | 13.131313131313133 | 28.593023255813954 | 26.5           | 22.533832293048103 | 1           | 79          | 0                       |
| 26 | mistralai/Mistral-7B-Instruct-v0.2    | 13.131313131313133 | 32.44186046511628  | 31.5           | 23.469431758911064 | 1           | 74          | 0                       |
| 27 | Qwen/Qwen1.5-7B-Chat                  | 13.131313131313133 | 35.96511627906977  | 35.5           | 24.2586298407603   | 1           | 78          | 0                       |
| 28 | google/gemma-7b-it                    | 12.121212121212121 | 36.44827586206897  | 36.0           | 24.081624095683534 | 1           | 78          | 0                       |
| 29 | mistralai/Mistral-7B-Instruct-v0.1    | 9.090909090909092  | 42.65555555555556  | 44.0           | 24.444002095645775 | 1           | 84          | 0                       |
| 30 | google/gemma-2b                       | 8.080808080808081  | 36.417582417582416 | 35.0           | 24.62476889189507  | 1           | 80          | 0                       |
| 31 | google/gemma-2b-it                    | 8.080808080808081  | 44.989010989010985 | 45.0           | 26.357581454338714 | 1           | 89          | 0                       |
| 32 | WizardLM/WizardLM-13B-V1.2            | 7.07070707070707   | 31.67391304347826  | 29.5           | 23.960181572837556 | 1           | 80          | 0                       |

## Benchmark dataset  
Link to the dataset on HuggingFace Hub:   
[Repetitive Sums Benchmark Dataset](https://huggingface.co/datasets/the-french-artist/repetitive_sums_benchmark_leaderboard/viewer/default/train) 

First seven rows:   

| sum                     | result |
|-------------------------|--------|
| 1+1                     | 2      |
| 1+1+1                   | 3      |
| 1+1+1+1                 | 4      |
| 1+1+1+1+1               | 5      |
| 1+1+1+1+1+1             | 6      |
| 1+1+1+1+1+1+1           | 7      |
| 1+1+1+1+1+1+1+1         | 8      |

We have 99 rows with two features:  
* `sum` is a repetitive sum of ones  
* `result` is the expected result of this sum. Values ranges from 2 to 100.  

## Leaderboard dataset  

This is where the leaderboard is updated after each notebook is executed.  

[Repetitive Sums Benchmark Leaderboard](https://huggingface.co/datasets/the-french-artist/repetitive_sums_benchmark_leaderboard/viewer/default/train)

## Notebooks used to populate the leaderboard  

Below are the 4 notebooks used to benchmarks the models:  
* `benchmark_repetitive_sums_dataset_using_together_ai.ipynb`
* `benchmark_multiple_openai_models_using_repetitive_sums_dataset_and_few_token_completion_method.ipynb`
* `benchmark_multiple_google_models_using_repetitive_sums_dataset_and_few_token_completion_method.ipynb`
* `benchmark_multiple_anthropic_models_using_repetitive_sums_dataset_and_few_token_completion_method.ipynb`

## Method explanation  

1. Make a prompt to ask for the result of a given sum  
2. Pass the `sum` feature  
3. WHEN POSSIBLE: limit the number of tokens produced by the LLM  
4. Extract digits from the result string and convert to integer  
5. Compare to `result` feature  
6. Compute stats and update leaderboard

## Show correct sums positions  

The images are included in the folder `position of correct sums`.  

![claude3-haiku.png](./position%20of%20correct%20sums/claude3-haiku.png)

![claude3-opus.png](./position%20of%20correct%20sums/claude3-opus.png)

![claude3-sonnet.png](./position%20of%20correct%20sums/claude3-sonnet.png)

![gemini-1.0-pro.png](./position%20of%20correct%20sums/gemini-1.0-pro.png)

![gemini-1.5-flash.png](./position%20of%20correct%20sums/gemini-1.5-flash.png)

![gemini-1.5-pro.png](./position%20of%20correct%20sums/gemini-1.5-pro.png)

![gemma-2b-it.png](./position%20of%20correct%20sums/gemma-2b-it.png)

![gemma-2b.png](./position%20of%20correct%20sums/gemma-2b.png)

![gemma-7b-it.png](./position%20of%20correct%20sums/gemma-7b-it.png)

![gemma-7b.png](./position%20of%20correct%20sums/gemma-7b.png)

![gpt-3.5-turbo-0125.png](./position%20of%20correct%20sums/gpt-3.5-turbo-0125.png)

![gpt-3.5-turbo-1106.png](./position%20of%20correct%20sums/gpt-3.5-turbo-1106.png)

![gpt-4-0125-preview.png](./position%20of%20correct%20sums/gpt-4-0125-preview.png)

![gpt4-0613.png](./position%20of%20correct%20sums/gpt4-0613.png)

![gpt4-1106-preview.png](./position%20of%20correct%20sums/gpt4-1106-preview.png)

![gpt4-turbo-2024-04-09.png](./position%20of%20correct%20sums/gpt4-turbo-2024-04-09.png)

![gpt4o-2024-05-13.png](./position%20of%20correct%20sums/gpt4o-2024-05-13.png)

![llama-3-70b-chat-hf.png](./position%20of%20correct%20sums/llama-3-70b-chat-hf.png)

![llama-3-8b-chat-hf.png](./position%20of%20correct%20sums/llama-3-8b-chat-hf.png)

![mistral-7b-instruct-v0.1.png](./position%20of%20correct%20sums/mistral-7b-instruct-v0.1.png)

![mistral-7b-instruct-v0.2.png](./position%20of%20correct%20sums/mistral-7b-instruct-v0.2.png)

![mistral-7b-instruct-v0.3.png](./position%20of%20correct%20sums/mistral-7b-instruct-v0.3.png)

![mixtral-8x22b-instruct-v0.1.png](./position%20of%20correct%20sums/mixtral-8x22b-instruct-v0.1.png)

![mixtral-8x22b.png](./position%20of%20correct%20sums/mixtral-8x22b.png)

![nous-hermes-2-yi-34b.png](./position%20of%20correct%20sums/nous-hermes-2-yi-34b.png)

![qwen-1.5-14b-chat.png](./position%20of%20correct%20sums/qwen-1.5-14b-chat.png)

![qwen-1.5-32b-chat.png](./position%20of%20correct%20sums/qwen-1.5-32b-chat.png)

![qwen-1.5-7b-chat.png](./position%20of%20correct%20sums/qwen-1.5-7b-chat.png)

![qwen1.5-72b-chat.png](./position%20of%20correct%20sums/qwen1.5-72b-chat.png)

![qwen2-72b-instruct.png](./position%20of%20correct%20sums/qwen2-72b-instruct.png)

![wizardlm-13b-v1.2.png](./position%20of%20correct%20sums/wizardlm-13b-v1.2.png)

![wizardlm-2-8x22b.png](./position%20of%20correct%20sums/wizardlm-2-8x22b.png)

![yi-34b-chat.png](./position%20of%20correct%20sums/yi-34b-chat.png)
