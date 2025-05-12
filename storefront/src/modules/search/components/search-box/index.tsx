import { XMarkMini } from "@medusajs/icons";
import { FormEvent } from "react";
import { useRouter } from "next/navigation";

import SearchBoxWrapper, {
  ControlledSearchBoxProps,
} from "../search-box-wrapper";

const ControlledSearchBox = ({
  inputRef,
  onChange,
  onReset,
  onSubmit,
  placeholder,
  value,
  ...props
}: ControlledSearchBoxProps) => {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    event.stopPropagation();

    onSubmit?.(event);

    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleReset = (event: FormEvent) => {
    event.preventDefault();
    event.stopPropagation();

    onReset(event);

    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div {...props} className="w-full">
      <form action="" noValidate onSubmit={handleSubmit} onReset={handleReset}>
        <div className="flex items-center w-full gap-x-2 bg-gray-100 rounded-md px-3 py-2">
          <input
            ref={inputRef}
            data-testid="search-input"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            placeholder={placeholder}
            spellCheck={false}
            type="search"
            value={value}
            onChange={onChange}
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-500 focus:outline-none"
          />
          {value && (
            <button
              onClick={handleReset}
              type="button"
              className="flex items-center text-gray-600 hover:text-gray-800 focus:outline-none"
            >
              <XMarkMini className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

const SearchBox = () => {
  const router = useRouter();

  return (
    <SearchBoxWrapper>
      {(props) => <ControlledSearchBox {...props} />}
    </SearchBoxWrapper>
  );
};

export default SearchBox;
