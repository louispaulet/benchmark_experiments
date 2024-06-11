# benchmark_experiments 🧪📊

Welcome to the **benchmark_experiments** repository! Here, we rigorously benchmark Large Language Models (LLMs) against the MMLU dataset and other carefully curated datasets. Let's dive into the fascinating details of our experiments!

## MMLU Dataset - Multiple Voters 📈🤖

In this folder, you'll find all the notebooks related to our collective intelligence experiment on the shuffled MMLU dataset.

### Key Insights:

1. **Choice Order Matters**: LLM performance is influenced by the order of choices in multiple-answer questions.
2. **New Dataset Creation**: We created a new MMLU dataset containing all possible permutations of choice orders.
3. **Inference and Voting**: We performed inference and voted for the most popular answer for each question.
4. **Analysis**: We analyzed the impact of voter count, shuffle order, and choice position on the final output (mean accuracy).

### Results:

- **Accuracy Boost**: We observed a significant jump in average accuracy from 52% to 62%, albeit at the cost of 24x more computational power.
- **Efficiency Trade-off**: A more moderate accuracy increase from 52% to 60% is achievable with "only" a 10x increase in computational power.

## MMLU Dataset - RAG on Choices 🧠🔍

In this experiment, we performed long-form inference to answer each MMLU question, from a single output token to 64, followed by Retrieval-Augmented Generation (RAG) to retrieve the closest answer from the choices.

### Findings:

- **Moderate Increase**: We achieved a moderate accuracy increase from 52% to 55%.
- **Challenges**: Some regression losses were noted due to suboptimal RAG performance.

## Simple Sum Dataset ➕🧮

We created a straightforward dataset consisting of two features: "sum" and "answer".

### Dataset Details:

- **Sum**: Contains a sum of ones (e.g., 1+...+1).
- **Answer**: Contains the result of this sum.

### Variations:

1. **Standard Dataset**: Direct sums and their correct answers.
2. **MMLU-Style Dataset**: Provides 4 choices for each sum. Two choices are random numbers between 2 and 100, one is the correct answer, and one is a direct neighbor of the correct answer.

### Benchmarking Protocols:

We explored five main ways to ensure a robust benchmarking protocol:

1. Free output with a constrained number of tokens.
2. Output enforcement using a regex.
3. MMLU-style last token logit probability measure.
4. MMLU-style ABCD answer with output enforcer regex.
5. Long form (64 allowed tokens) with RAG to find the closest MMLU-style answer.

### Conclusions:

- **Non-MMLU-Style Benchmark**: Performed better as small LLMs exhibit poor instruction-following capabilities.
- **Best Methods**: Methods 2 and 5 were the most effective, with Method 2 being preferable for performance (fewer tokens to generate).
- **Counting Ability**: LLAMA 8B Q4 can count up to 16 when given repetitive sums of ones.

Feel free to explore the repository and experiment with the provided notebooks. Your insights and contributions are always welcome! 🚀
