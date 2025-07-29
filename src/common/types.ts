interface ApiResponse<T> {
  status: string;
  message: string;
  statusCode: number;
  data: T;
}

interface ApiError {
  status: string;
  message: string;
  statusCode: number;
}

export { ApiResponse, ApiError };
