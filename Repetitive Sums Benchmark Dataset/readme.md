# Repetitive sums benchmark

Below is the current leaderboard.  
Skip to the end to see the benchmark and leaderboard datasets on HuggingFace Hub, and method explanation.  

## Current leaderboard

|   | model_name                             |   avg_accuracy |   error_mean |   error_median |   error_std |   error_min |   error_max |   parsing_failure_count |
|---|----------------------------------------|----------------|--------------|----------------|-------------|-------------|-------------|-------------------------|
| 0 | gpt-4o-2024-05-13                      |      72.7273   |     3.66667  |           2    |     3.25813 |           1 |          12 |                       0 |
| 1 | gpt-4-0125-preview                     |      44.4444   |    11.5636   |           9    |     9.68153 |           1 |          34 |                       0 |
| 1 | gemini-1.5-flash                       |      40.404    |    15.5763   |          13    |    12.5123  |           1 |          42 |                       0 |
| 2 | gpt-4-turbo-2024-04-09                 |      39.3939   |    14.85     |          10.5  |    12.5884  |           1 |          41 |                       0 |
| 3 | gpt-4-1106-preview                     |      38.3838   |    13.8689   |           9    |    11.9715  |           1 |          42 |                       0 |
| 4 | gpt-4-0613                             |      37.3737   |     8.48387  |           5.5  |     7.88595 |           1 |          30 |                       0 |
| 5 | mistralai/Mixtral-8x22B                |      34.3434   |    15.5692   |          11    |    13.677   |           1 |          43 |                       0 |
| 6 | mistralai/Mixtral-8x22B-Instruct-v0.1  |      32.3232   |    16.0597   |          11    |    13.0266  |           1 |          43 |                       0 |
| 0 | gemini-1.0-pro                         |      31.3131   |    15.7258   |           6    |    35.2267  |           1 |         273 |                       6 |
| 2 | gemini-1.5-pro                         |      30.303    |    10.2899   |           9    |     7.67751 |           1 |          28 |                       0 |
| 7 | Qwen/Qwen2-72B-Instruct                |      26.2626   |    23.5342   |          22    |    15.9235  |           1 |          54 |                       0 |
| 8 | microsoft/WizardLM-2-8x22B             |      26.2626   |    13.0274   |          10    |    10.8256  |           1 |          38 |                       0 |
| 9 | gpt-3.5-turbo-0125                     |      24.2424   |     6.57333  |           6    |     5.13118 |           1 |          20 |                       0 |
|10 | meta-llama/Llama-3-70b-chat-hf         |      22.2222   |     9.88312  |           8    |     7.2909  |           1 |          26 |                       0 |
|11 | Qwen/Qwen1.5-32B-Chat                  |      21.2121   |    12.8077   |          11    |     9.45812 |           1 |          36 |                       0 |
|12 | Qwen/Qwen1.5-72B-Chat                  |      20.202    |    13.7722   |           9    |    11.7876  |           1 |          40 |                       0 |
|13 | gpt-3.5-turbo-1106                     |      18.1818   |     7.75     |           6.5  |     6.08194 |           1 |          23 |                       5 |
|14 | meta-llama/Llama-3-8b-chat-hf          |      18.1818   |    30.1235   |          29    |    21.9262  |           1 |          69 |                       0 |
|15 | zero-one-ai/Yi-34B-Chat                |      17.1717   |    40.5122   |          29.5  |    60.7988  |           1 |         340 |                       0 |
|16 | mistralai/Mistral-7B-Instruct-v0.3     |      16.1616   |    29.8193   |          28    |    21.6807  |           1 |          69 |                       0 |
|17 | Qwen/Qwen1.5-14B-Chat                  |      14.1414   |    29.4118   |          30    |    16.9286  |           1 |          60 |                       0 |
|19 | google/gemma-7b                        |      13.1313   |    47.7558   |          54    |    29.6612  |           1 |          99 |                       0 |
|18 | NousResearch/Nous-Hermes-2-Yi-34B      |      13.1313   |    28.593    |          26.5  |    22.5338  |           1 |          79 |                       0 |
|21 | mistralai/Mistral-7B-Instruct-v0.2     |      13.1313   |    32.4419   |          31.5  |    23.4694  |           1 |          74 |                       0 |
|20 | Qwen/Qwen1.5-7B-Chat                   |      13.1313   |    35.9651   |          35.5  |    24.2586  |           1 |          78 |                       0 |
|22 | google/gemma-7b-it                     |      12.1212   |    36.4483   |          36    |    24.0816  |           1 |          78 |                       0 |
|23 | mistralai/Mistral-7B-Instruct-v0.1     |       9.09091  |    42.6556   |          44    |    24.444   |           1 |          84 |                       0 |
|24 | google/gemma-2b                        |       8.08081  |    36.4176   |          35    |    24.6248  |           1 |          80 |                       0 |
|25 | google/gemma-2b-it                     |       8.08081  |    44.989    |          45    |    26.3576  |           1 |          89 |                       0 |
|26 | WizardLM/WizardLM-13B-V1.2             |       7.07071  |    31.6739   |          29.5  |    23.9602  |           1 |          80 |                       0 |


## Benchmark dataset  
[Repetitive Sums Benchmark Dataset](https://huggingface.co/datasets/the-french-artist/repetitive_sums_benchmark_leaderboard/viewer/default/train)

## Leaderboard dataset  

[Repetitive Sums Benchmark Leaderboard](https://huggingface.co/datasets/the-french-artist/repetitive_sums_benchmark_leaderboard/viewer/default/train)

## Notebooks used to populate the leaderboard  

Below are the 3 notebooks used to benchmarks the models:  
* `benchmark_repetitive_sums_dataset_using_together_ai.ipynb`
* `benchmark_multiple_openai_models_using_repetitive_sums_dataset_and_few_token_completion_method.ipynb`
* `benchmark_multiple_google_models_using_repetitive_sums_dataset_and_few_token_completion_method.ipynb`

## Method explanation  

1. Make a prompt to ask for the result of a given sum  
2. Pass the `sum` feature  
3. WHEN POSSIBLE: limit the number of tokens produced by the LLM  
4. Extract digits from the result string and convert to integer  
5. Compare to `result` feature  
6. Compute stats and update leaderboard